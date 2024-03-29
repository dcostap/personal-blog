---
layout:     post
title:      "Error handling in Kotlin - My current approach."
---

> This is kind of an add-on to my other post (that babbles about my general thoughts on error-handling).

Kotlin is in a bit of a special place in terms of error handling, since it took on some baggage by having to live in the JVM and coexist with Java. 
As such, many consider the state of Kotlin's error handling to be imperfect. I agree to an extent, since there's no one true standard way to handle errors - unlike languages like Rust.

The closest we have to an standard is a post by the Kotlin lead: [https://elizarov.medium.com/kotlin-and-exceptions-8062f589d07](). 
However, many argue that his solution of "writing specific sealed classes to represent each failure case" is imperfect and kotlin's stdlib doesn't even follow that advice most of the time.

# How I handle bugs

Bugs: exceptional cases the programmer can't handle, since they represent an oversight or an incorrect state of the program - "handling" them means... fixing the bug. 

I leverage java's Exception system here. 

If a bug happens, the end result should be always the same: forcefully exiting your current execution point and crash with a helpful stacktrace / show the user a message.

If the application is a GUI or something similar, in which case crashing isn't ideal, I write a top-level `try {} catch {}` that handles all possible Exceptions and displays some info for the user of the application.
Here, the stacktrace would be also printed to the console, and the GUI may even contain a little button to check that stacktrace info or other exception details without having to exit the GUI.

## Assertions: explicitly catching bugs early

I like assertions. I try to use kotlin's `require()` and `check()` more and more. They are great for peace of mind and to document the assumptions you have about things that "must be true" at a given point in your code. As a bonus, in Kotlin, these kind of checks also become a useful way to trigger smart-casting.
- `require()` internally throws a `IllegalArgumentException`; it's meant to validate a function's arguments. Write it at the start of each function; it's the best way to document that a certain passed Int must never be `< 0`, etc.
- `check()` is used in my codebases for any other assumption that _must_ be true in the middle of my business logic.

# How I handle expected / anticipated errors

For most simple cases (to just encode the absence of a result), I use nullable types. Kotlin's null safety plus its null-checking syntax makes this a great way to handle the possibility of failure.
 
However, this won't be enough if I want to return extra information about why something failed, or encode which one of a closed-set of failures this one belongs in.
This is where error-handling in Kotlin gets a bit more complex, as there's no standard solution - you've got to pick your poison.
 
Some people use [libraries](https://github.com/arrow-kt/arrow) that embrace functional-style error types, drawing inspiration from Rust and probably other languages. 

I decided to pick a simpler approach and use Kotlin's `Result`. While imperfect, it suits my needs.

Thus, all the functions that may fail (in expected and known ways) to return the expected value, will return a `Result<MyValue>`.

## Interfacing with java code

This is a bit tricky since Kotlin decided to do away with java's checked Exceptions. 
This means that unfortunately you never know if a java method you are calling may throw a Exception.
Thus, I have to be careful and consider the Exceptions each java method may throw, and consider which ones I am interested in to wrap them in my kotlin `Result`.
Most of the time though, I simply use kotlin's `runCatching` which does this wrapping for me. However, it's an imperfect solution once again (it catches all Exceptions, including those that are bugs, like with most `RuntimeException`).

## Explictly using Exceptions?

The [blog post](https://elizarov.medium.com/kotlin-and-exceptions-8062f589d07) I mentioned at the start, written by the Kotlin project lead, mentions the hairy case of handling I/O errors. 
They aren't bugs, yet handling every single I/O function call with `Result` becomes verbose and annoying, since many calls like these may be packed together in long functions. 
In this case, I do what the blog post recommends, and I let those calls throw their java Exceptions normally, or even throw the Exceptions myself if needed. 
Then, **I wrap the relevant piece of code in a `runCatching`** or similar. 

The point here, I/O or not, is to leverage `throw Exceptions` to provide **simple and non-verbose early exits inside a long piece of code that may have multiple points of failure.**

Even without dealing with I/O, I use this to sometimes more easily propagate errors and exit a function, without having to add multiple checks with their own `return` (which gets verbose when inside nested lambdas). With exceptions, I just need to use constructs like `getOrThrow()` or a explicit `throw`.

At the end, of course, you're left with a `Result` that you return.

## The downsides

Using `Result` everywhere means I can now provide extra information about my errors, but it's still hard to tell the caller that there's different types of errors in a given function: `Result`'s error type is `Throwable`.
I didn't yet need this in any of my projects, but I would just create my custom subclass tree of `Throwable`. 
It's not as clean as being able to provide a `sealed class` hierarchy of errors, where ALL the possible cases are explicitly defined, and enforced by the compiler when doing checks against one.
But it'll have to do.
