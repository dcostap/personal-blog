---
layout:     post
title:      "Game Development is not that hard. It's just that everyone makes the same mistakes time and time again"
toc: true
---


![Dunning-Kruger](https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Dunning%E2%80%93Kruger_Effect_01.svg/1200px-Dunning%E2%80%93Kruger_Effect_01.svg.png)

What I've learned helped me notice all the silly mistakes I did in the past. I eventually reached the "Valley of Despair", which is where I am staying right now. It's a tricky place to be in: I know what I am doing wrong, but I am not skilled enough to bypass the mistakes or find the right solutions.

But now that I reached this valley, I can't help but notice all the mistakes fellow indie gamedevs make time and time again.

## No prototyping, or straight up running ahead with your game idea hoping it'll turn out good


<blockquote>
  <p>
    The Isle of Elanor is an open-ended role-playing game, featuring a High Fantasy theme and setting.
<ul>
    <li>Branching Story Lines</li>
    <li>Character Building</li>
    <li>Factional Alignment</li>
    <li>Character Progression</li>
    <li>Combat Mechanics and Variety</li>
    <li>Consequences</li>
    </ul>
  </p>
  <footer><cite title="Wise programmer"><a href="https://www.commonwombat.com/blog/">The Isle of Elanor</a></cite></footer>
</blockquote>

This game has "Combat Mechanics and Variety", "Consequences", "Character Building"... I mean, it's a recipe for success!

Most game ideas are vague at their best, or plain bad at their worst. And yet, game developers seem to hate prototyping them - me included.

I hate prototypes because they require you to write ugly code that just kinda works, and play a game with moving squares for graphics. I don't have fun doing that kind of game development, so I mostly ignore prototypes. That means I waste a lot of time just testing the most basic ideas I have... But I still have a clear objective in mind: testing the idea. I just happen to prioritize having fun while doing it: enjoying coding and enjoying making a cool looking prototype. And when it turns out it's boring... Welp, at least I had fun and I finished something that looks good in screenshots!

However, some people take this problem to the extreme. They keep developing a game for years, with worryingly vague ideas set in stone because they sound good in their heads. They put a lot of effort into something that's just a mix of common mechanics, hoping that the game will turn out fun because it mixes a bit of everything.


## Worrying about clean or mantainable code during the initial stages

Even when indie gamedevs avoid the previous mistake (by having a clear objective: testing your idea and iterating on it), I see many of them pouring too much effort into their codebase. When the game is still taking its shape, the focus should be on quick & dirty code that lets you easily make changes and iterate.

Bob Nystrom said it best:

<blockquote>
  <p>
    If you are going to ditch code, don’t waste time making it pretty. Rock stars trash hotel rooms because they know they’re going to check out the next day.
  </p>
  <footer><cite title="Wise programmer"><a href="https://gameprogrammingpatterns.com/architecture-performance-and-games.html#get-on-with-it,-already">Game Programming Patterns / Introduction</a></cite></footer>
</blockquote>

Game Design is too complex to pretend you'll get it perfect on your first try... Your game idea can't stay in your head or in a Game Design Document. You oughta get the game up and running, and actually test your ideas and designs by playing the product. Ugly code and quick solutions are the way to go.

I personally loathe ugly code, so I try my best to achieve "clean" but also quick solutions... I mostly fail at this though. I spend too much time on simple stuff, or overthinking how to best solve a problem, when it'd be best to just hardcode the solution and be done with it. The more I get better at this, the more I start to loathe [unneeded complexity and abstractions in code]({% link _rants-and-opinion-pieces/2021-07-16-beauty-of-simple-code.md %}).


![Discord GameDev Community Screenshot](/assets/Discord_lyk8aZcKpc.png)

<small>- Just your average indie gamedev overcomplicating everything</small>

## Wasting time on tools instead of the actual game

This is a really bad sign. The truth may be that the developer got bored of the game idea, so he decides to invest time and effort into tools that *may* help him in the future. This way you won't feel like you are pausing the project; it's just a small break from the game itself, until the motivation comes back later (*it never does*).

I, too, made this mistake in the past. Pouring time on premature optimization always feels like a productive and fun task. Outside of gamedev, I always get carried away optimizing my coding workflow... I spend hours on stuff that will actually save me minutes in the long run.

### "Lemme just make a custom map editor real quick"
A common example of this kind of mistake is developing a fleshed-out custom map editor for the game, when there are already a lot of [free](https://www.mapeditor.org/), [polished](https://ldtk.io/) & [ever-evolving](https://github.com/Ogmo-Editor-3/OgmoEditor3-CE) options available.

To be fair, a map editor is one of the easiest tools to get up and running, since you only need to add some basic functionality on top of the game code you already have. But when it gets to the point where you are adding advanced options like a custom script system or support for exporting the map to external file formats... Maybe that's a bit too much.

The latter (exporting maps to external files) adds so much complexity: now you need to define rules for everything your map editor supports, so all the info in it can be serialized. And then you need to write the import & export code. And when everything breaks, you'll have to go back to that codebase, pausing the actual game development yet again.

### Let's edit all the particle effects in a GUI, it'll be so cool and awesome

I never understood GUI particle editors. They have the development complexity of a custom map editor, but its benefits aren't as clear to me.

I too like to juice my games (to worrying levels) with cool animations and particles, so when I wanna add some cool particle effects... I just do it in code. It's straightforward and lets me have all the flexibility I want. I don't need to formally define which properties a particle effect should have, so then I can write the serialization logic, the editor interface, etc... The whole concept seems like a nightmare to develop & mantain.

These tools sound cool in theory, and they certainly have some advantages, the biggest one being the support for modding... But this will only be useful if the game actually gets finished.

## In conclusion...

I don't actually believe in what the title says (clickbait much?); it's really hard to finish a game, and when you do there's a minuscule chance it will turn out to be good. There's so much stuff that can go wrong: games are comprised of many different parts that require different kinds of skills.

The best thing you can do as a game developer is to fail faster so you can improve faster; and the most common mistakes I see prevent just that.

Roll the dice more times and you will get more chances to finish an actually good game.
