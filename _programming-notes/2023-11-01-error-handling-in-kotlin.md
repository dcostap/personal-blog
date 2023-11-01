---
layout:     post
title:      "Error handling in Kotlin - My current approach."
---

> This is kind of an add-on to my other post abut error-handling in general.

Kotlin is in a bit of a special place in terms of error handling, since it took on some baggage by having to coexist with Java. 
As such, many consider the state of Kotlin's error handling to be imperfect. I agree to an extent, since unlike Rust there's no one true standard way to handle errors.

The closest we have to an standard is a post by the Kotlin lead: [https://elizarov.medium.com/kotlin-and-exceptions-8062f589d07](). 
However, many argue that his solution of "writing specific sealed classes to represent each failure case" is imperfect and kotlin's stdlib doesn't even follow that advice most of the time.

# How I handle bugs

Bugs: exceptional cases that make no sense to handle, since they represent an oversight or an incorrect state of the program. 
I leverage java's Exception system here. 

If a bug happens, the end result should be always the same: forcefully exiting your current execution point and crash with a helpful stacktrace / show the user a message.

If the application is a GUI or something similar, in which case crashing isn't ideal, I write a top-level `try {} catch {}` that handles all possible Exceptions and displays some info for the user of the application.
Here, the stacktrace would be also printed to the console, and the GUI may even contain a little button to check that stacktrace info or other exception details without having to exit the GUI.

## Assertions: explicitly catching bugs early

I like assertions. I try to use kotlin's `require()` and `check()` more and more. They are great for peace of mind and to document the assumptions you have about things that "must be true" at a given point in your code.
- `require()` internally throws a `IllegalArgumentException`; it's meant to validate a function's arguments. Write it at the start of each function; it's the best way to docuemnt that a certain passed Int must never be `< 0`, etc.
- `check()` is used in my codebases for any other assumption that _must_ be true in the middle of my business logic. With Kotlin's smart casting, it can help you auto-casting a nullable value into non-null for the rest of the code:
```kotlin
var value: Type? = null
// (...) some complex logic that ultimately assigns argument a non-null value.
// However this logic is too complex for the compiler to be sure that the value gets always assigned, so we have to init the variable with a null value.

// here, a null argument would be a logic error
check(value != null)

// from now on, argument is auto-casted to be a non-null Type, no need for further null-checks
```

# How I handle expected exceptional cases

For most simple cases I use nullable types. Kotlin's null safety plus its null-checking syntax makes this a great way to handle the possibility of failure.
 
However, this won't do whenever I want to return extra information about why something failed, or which one of a closed-set of failures this was.
This is where error-handling in Kotlin gets complex, as there's no standard solution. 
 
Some people use [libraries](https://github.com/arrow-kt/arrow) that embrace functional-style error types, drawing inspiration from Rust and other languages. 

I decided to pick a simpler approach and use Kotlin's `Result`. While imperfect, it suits my needs.

## Interfacing with java code

This is a bit tricky since Kotlin decided to do away with java's checked Exceptions. 
This means that unfortunately you never know if a java method you are calling may throw a Exception.
Thus, I have to be careful and consider the Exceptions each java method may throw, and consider which ones I am interested in to wrap them in my kotlin `Result`.
Most of the time though, I simply use kotlin's `runCatching` which does this wrapping for me. However, it's an imperfect solution once again (it catches all Exceptions, including those that are considered errors, like `RuntimeException`).

## Explictly using Exceptions

The only case in which I use Exceptions is whenever I want to provide an early exit for a complex function that may have multiple points of failure. 
This allows me to more easily propagate errors and exit a function, without having to add multiple checks with their own `return` (which gets verbose when inside nested lambdas). With exceptions, I just need to use constructs like `getOrThrow()` or a explicit `throw`.

Then, I wrap the relevant piece of code in a `runCatching`.

## The downsides

Using `Result` everywhere means I can now provide extra information about my errors, but it's still hard to tell the caller that there's different types of errors in a given function: `Result`'s error type is `Throwable`.
I didn't yet need this in any of my projects, but I would just create my custom subclass tree of `Throwable`. 
It's not as clean as being able to provide a `sealed class` hierarchy of errors, where ALL the possible cases are explicitly defined, and enforced by the compiler when doing checks against one.
But it'll have to do.
