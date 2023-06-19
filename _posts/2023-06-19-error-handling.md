---
layout:     post
title:      Error handling - Common issues and best modern approaches.
---

> This is a set of personal notes and thoughts, most of which were compiled after reading this [great blog entry by Joe Duffy](https://joeduffyblog.com/2016/02/07/the-error-model/)

Unlike other aspects of programming, error handling seems to me like one of the few problems to have a few known best practices and pitfalls (gathered after decades of imperfect error handling paradigms implemented in old languages).

And like with all other programming areas, there still isn't a "one true right way" to do error handling. However, analyzing the pitfalls of each approach seemed to be very easy, given that all modern languages iterated on the old ways of doing error handling in common and logical ways.

Consequently, I have compiled a personal compendium of notes and preferred strategies for error handling, which I hope will serve as a useful reference to whoever lost soul happens to stumble upon this blog entry.

## Programming errors / Bugs
Wrong indexing of an array, divide by zero, NPE... These are the programmer's fault and can happen anytime. Whenever it happens the program should immediatly crash / exit, since it compromises the rest of the program's execution and data flow. These errors should never happen, so there's no point in handling them (_well, not quite, see next section..._).

### Automatic Restarting. Modular systems.
Sometimes it can be useful to handle unrecoverable bugs, preventing a full crash. As such, even if these kind of issues are propagated in a different manner than exceptions, there should be a way to catch and provide alternative paths too - but handled at a higher level, closer to the root process. Normally this means completely restarting the process that crashed.

In this case, the whole program should be built as a modular system, such that crashes don't just shutdown the whole program.

In a GUI application, for instance, the graphic process should be separated from the execution process. If user clicks on a button that triggers a glitchy code execution, instead of closing the whole program the graphic process can catch those fatal errors, log them as normal, show an error message box, and continue running the GUI as normal. In this case executions triggered on button clicks etc can be just additional threads that are spun up as needed.

### Assertions / Early exits
Assertions can be used to...
- validate a function's arguments. These assertions - ideally placed at the start of a function's body -  will crash the program if any argument is wrong. They also cleanly and explicitly state what arguments are invalid.
- explicitly marking what conditions _can't_ be true at a certain point according to programmer's assumptions about how the program should work. These assertions mostly provide peace of mind and allow early crashes.

While assertions are never 100% needed - during these invalid states, supposedly the program would crash later anyway - they are a good resource to help the program crash as early as possible.

## Exceptions
Unlike bugs, exceptions are invalid states that may arise outside of the the programmer's control. As such, handling these is a requirement for a robust codebase.

The best kind of exception-handling paradigm would feature:
- call-site transparency: when you call a function, is it clear it may cause an exception. Java's whole `Exception` system fails at this.
- no special control flow when an exception happens. This simplifies error handling by being just another  part of the normal control flow. Java's `try / catch / finally` way of handling exceptions has a goto-feel. From first glance, you don't know which functions may throw an Exception. And when they do, the execution jumps to a separate code block...
- simplicity when defining the possible exceptions. Java fails at this too. No matter how small the exception is, you are supposed to choose and pick from a big open hierarchy of built-in Exceptions - so most programmers just may throw a generic Exception or return null (which isn't safe at all in Java and the root of most runtime crashes due to oversights).
- sealed exception types. There must be a **defined and closed set** of possible failure types. The compiler will then warn you whenever you handle an error and miss to consider one of the exception possibilities, or when you add a new type of error and miss handling that new case everywhere it's needed.
- forced / checked exception handling. User must handle all possible exceptions.
- differentiate exceptions from bugs. Don't mix them together like Java does.
- allow nullable types as a special alternative type (provided the language prevents you from safely accessing nullable types). This way you allow the simplest kind of error-handling: functions may just return null if something's wrong. In most cases this suffices, since most of the time you don't actually need a lot of info about what went wrong.

Old error-handling paradigms:
- C's return error codes don't guarantee anything (you may forget to check the error code, or forget to check all possibilities, etc...) but they are very simple.
- Java-like `throw Exception` has many issues, but it does the job.

Implementing exceptions as complex return data types (Result<MyErrorType, Int>) seems the best solution, provided the language contains modern features like smart-casting:
- forced to handle the possible exceptions since the resulting value is hidden inside that data type - the user has to "unbox" the data to actually use the resulting value.
- the docs / info for possible exceptions is embedded into the function signature itself (return type) without special syntax (`throws`).
- since the return type you are interested in is the one data type that also contains the possible exceptions, call-site calls clearly show which functions may return exceptions.
- simple to define your exceptions. They are just lightweight data types (can be just simple enums you create or some standard (`Result` / `Either`) generic container), and they can be complex if needed (to contain more info about the exception that happened)
- exception handling isn't restricted to a special block or a different kind of control-flow.

As a downside, the way to "unbox" the useful value may be cumbersome and adds more lines of code on each callsite. Some libraries try to implement many functional concepts to handle / accumulate / process these complex return values, and the resulting code becomes too complex.