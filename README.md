### What the hell is this?
This project is a tool for building mathematical theories and/or philosophical propositions.
One can create statements from scratch (Axioms), or use existing statements to generate new statements (theorems) using **certain rules** of transformations.


### What theories?
Any theory. MathAsm does not care about the specifics of your theory.
You are may dealing with calculus, set theory, Lagrangian mechanics, Differential geometry, or creating your own crazy-nerdy stuff.

Or maybe, you are more of a philosophy nerd who want to prove/disprove the existence of God,
claim whether objective morality exists and so on.
MathAsm might be a tool for you too.


### How is it possible that MathAsm does not care about theory specifics?
MathAsm tries to see what all mathematical theories have in common, what is the basis of them all, focus on that and only on that.
This applies in philosophical propositions, too (I guess).

It is similar to the instruction set of a CPU: the instruction set does not care about the type of the application you build.
It is the same one, and only one for every application.


### So, are you trying to define the instruction set of mathematics?
Exactly! And provide a web app where people can use it to create their own theories,
or import existing mathematical theories into MathAsm (such as boolean algebra) and play with them.


### Who are you? 
I am Alkis Mavridis and MathAsm is an idea that I started developing about 10 years ago.
I am now building a web app (with the help of some amazing colleagues and friends!) in order to further illustrate the usage of MathAsm
and as a tool for start "importing" existing mathematical and scientific theories into MathAsm.

If this would be successful, one could even use it for demonstrating/exploring philosophical theories,
even drive political debates, by for ex. listing commonly accepted assumptions and explore in an objective and irrefutable way the
conclusions that those assumptions lead to.

Maybe this could be good and constructive for humanity, which is precisely the reason why I think that nobody will give a crap about MathAsm.
I will still publish it, though. It is fun, and who knows - maybe some crazy math/philosophy nerd will be happy to play with it.


### Ok, enough. More about this weird instruction set.
Ok, there are a couple of concepts that MathAsm is based upon.
I don't have time now for a proper documentation, so I will make a brief overview on how it works.
More info will come soon.

### So, explain me the basic concepts of MathAsm
The first basic concept is the symbol. Symbols are like the atoms of the MathAsm universe.
Stuff that you cannot divide further into smaller pieces.
In Math, symbols would include stuff like:

1 2 3 + = ( ) sin cos

For philosophical propositions, symbols would be words.
Technical detail: symbols do not need to be one character. For example != (not-equals) is a symbol.
true and false would be symbols too. Note the sin and cos from the example above too. All of those are symbols.

Moving on. Every theory has its own symbols, so one is free to define as many as needed.
MathAsm does not define any symbol. MathAsm does not care about your theory specifics. YOur theory will define its own symbols.

Oh, and the most important on symbols:
For MathAsm, symbols have **no meaning**, **no internal functionality** and are considered **all equal**.



### Whaaaat?? Do you mean that the symbol 1 and the symbol + are treated the same by MathAsm?
Exactly. MathAsm treats all symbols equally. No internal properties are assumed anywhere in MathAsm.
The only thing that MathAsm cares about is whether a symbol is the same as an other one or not.
For example, consider the sentence: 1 + 1 = 2

In this sentence, the first and the third symbol are the same symbol (1).
But the second symbol (+) is a different one.
MathAsm will recognize this fact. Besides that, symbols have no internal properties.
Not even a little bit. Nada, nic, niente. Got the idea?


### No! How can then anyone build meaningful theories like that? 1 cannot be the same as 2! How can I give them different meaning?
With axioms. Only Axioms give meaning to the symbols. But you are rushing a bit. We are not yet there.


### Ok, I see. Move to the next concept, please.
The next concept is the sentence. Sentence is any collection of one-or-more symbols. Like:
- 1 + 1 = 2
- x + 2 = x - 2
- 5 * x
- ) 6 - ( x = / ( 55

Those are all valid sentences for MathAsm.


### I do not get it. How can those be valid sentences? The second is wrong, the third states nothing, and the fourth one looks more like my parrot walking on the keyboard.
MathAsm does not care about any of that. They are all valid sentences. Your parrot can use MathAsm, too.

### This has no sense! How can anyone build meaningful mathematical theories if we cannot distinguish proper from messed up syntax? Also, leave my parrot alone, weirdo!
You can distinguish between good and bad syntax.
Your axioms will make this distinction. Your axioms define what correct syntax even means.

MathAsm makes sure that the theorems are direct result of your axioms. They are born by your axioms.
This means that they will have the same syntactical rules and patterns.
Here is how good syntax works: You make good syntax in your axioms, you get good syntax in your theorems.
Whatever good syntax means to your theory.

Oh, one important note: the order matters: the sentences 1+2 and 12+ are two different sentences.

### At least, something that sounds familiar. So, axioms and theorems are sentences, such as x=x, right?
No, axioms and theorems are not sentences. MathAsm could not work with sentences.


### I do not understand a word. What are axioms and theorems then?
This is our next concept: theorems and axioms are **statements**.


### What is a statement? Is it not the same as a sentence? Is it not a collection of symbols?
Not quite. A Statement is a pair of sentences. Two sentences bounded together.
Every axiom and every theorem in MathAsm is exactly that: a pair of sentences.
One sentence on its own is useless according to MathAsm. Only pairs can function.
Lets call those sentences **left part** and **right part** of a statement.


### What does this pairing mean?
Here is where the key point of MathAsm. A statement defines a pair of sentences which can replace each other.
The left can replace the right and be replaced by the right. Like you can replace the sentence (4/2) with the sentence (8/4),
and vice versa. Those two would be a statement, probably a theorem in the theory of Arithmetic.

So, based on this statement, you could transform the sentence (5 - (4/2)) into (5 - (8/4)).
Replacing stuff with other stuff is how mathematics work according to MathAsm. We just have to  define which stuff may replace which stuff.


### Sounds good. So, are we done?
Of course not.


### What then?
There is one last key concept. A very important one: the connection.
We said that a statement is a pair of sentences, bounded together.
This bond (which we call **connection**) has its own properties.


### Ok so, a statement consist of left part - connection - right part?
Exactly. This is exactly the structure of a statement, the structure of every statement. No exceptions.


### What are the properties of the connection?
Connections have two properties: flow and grade.

The flow of every statement may be unidirectional or bidirectional. One or the other. There is no third option
Grade is a zero-or-more integer, with zero having a bit of special treatment by the instruction set.

Just to clarify: both flow and grade are permanent features of theorems and axioms. Once a theorem/axiom is created
with unidirectional flow and grade 3, for example, it stays like that for ever. These stuff are organic part of the theorem/axiom,
equally important to their sentences.

In this document, we will represent the connections like that:
- <--3-->   (bidirectional connection with grade 3)
- ---5-->     (unidirectional connection with grade 5)


### Ok got it. But what do those flows and grades do?
Well, it is time to talk about the **instruction set**.


### Ok, I hope this is the last one. I am bored.
Yes, it is the last one.
So, building axioms is easy and messy. Your parrot can make it, too.
Building an axiom? here is how it goes.

- Form a sentence. Any sentence! Just put one or more symbols in order. As many as you wish, and whichever you wish. This will be the left part of your axiom.
- Chose a flow for the connection. You like unidirectional? You chose unidirectional. Prefer bidirectional? You get bidirectional. Whatever you like.
- Chose a grade. Zero or positive number. Again, whichever you like.
- Repeat the step 1: form one more  sentence with whatever crap you want. This is the right part.

Congrats! You got your first axiom! You are now a theory father!


### Wait... Do you mean that I cad do anything I like?
Exactly! This is how you build axioms. You do anything you like, as long as it is a valid statement.
Building axioms is a total anarchy.

### Ok. And what about theorems?
Ok, lets talk about the theorem building. Here the picture is totally different.
There are strict rules on what one may do.
In fact, there are only 4 operations that we can perform.
These 4 things are the instruction set what we are talking about.

One may perform as many of those "moves" as desired to build new statements based on the existing ones.
Once ready, we **save** the new statement into the theory, which means that it can no longer be transformed.
It is then called a **theorem**.


### Ok. What are the 4 moves?
The first one is the cloning move.
You get an existing statement of the theory, theorem or axiom, and you copy it.
The one you chose to clone is called the **base** of the operation, and the resulting statement is the **target** of the operation.

The resulting statement will have the same flow and grade as the base, and its two sentences will be exact copies of the base's statements.
Simple and complete cloning.

### So this is how we start new statements. We copy old ones?
Exactly. And this may indicate how the syntax pattern preservation works. We talked about that before.


### Ok. The second instruction?
The second is the **single replacement** operation.
We have a target (the statement that we will transform) and an existing statement that we will use as base.
Now assume that we found an **appearance** of the left statement of the base somewhere in the target.

The **single replacement** operation replaces this oen appearance with the right side of the base.
One could replace the right with the left, too.

For example, if we have the base:
-  ( x + y ) <----> ( y + x )

and we are working on the target:
-  z + ( x + y ) ^ n - ( x + y ) <--2--> ( x + y ) + 1

We see that the sentence **( x + y )** appears 3 times on the target: 2 times in its left sentence and 1 time on its right.
We choose one of them, lets say the second on the left sentence. We replace it with its base counterpart, and we get:
-  z + ( x + y ) ^ n - **( y + x )** <--2--> ( x + y ) + 1.

This is the single replacement operation.

### Seems easy. Can I always perform it?
No. Here are the conditions under which this operation can be performed:
- We are allowed replace the **left** sentence of the base with its **right** one.
  If the base is bidirectional, we also allowed to do the opposite: replace the right with the left one.
  But replacing the right sentence with the left is illegal for unidirectional bases.
  
- We may perform single operations in the right side of the target statement.
  If the target is bidirectional, we may also perform it in its left sentence.
  But performing single replacement on the left sentence of a unidirectional target is illegal.
  
- The grade of a single replacement's base must be **zero**. Performing single replacement with a base of larger-than-zero grade is illegal.


### Ok. What is the third instruction?
The select **sentence operation**. This works exactly like the single replacement, but replaces many occurrences at once.
All the occurrences in the chosen sentence of the target.

Back to our example: Our base was:
- ( x + y ) <----> ( y + x )
and our target was:
-  z + ( x + y ) ^ n - ( x + y ) <--2--> ( x + y ) + 1

If we perform a sentence replacement on the target's left sentence we will get:
-  z + **( y + x )** ^ n - **( y + x )** <--2--> ( x + y ) + 1

The right sentence stayed intact, since we performed the operation on the left sentence.
If we had chosen the right one, we would get:
-  z + ( x + y ) ^ n - **( y + x )** <--2--> **( y + x )** + 1.


### I get the point, but this looks redundant. Why making it a new instruction, we could repeat the single replacement more times to achieve the same result.
True. But the reason we need to explicitly define it as its own more is that single repetition has to strict rules.
For example, it can be performed only with zero-grade bases.
The sentence replacement less strict rules. One may perform it when:

- Like before, we are allowed replace the **left** sentence of the base with its **right** one.
  Like before, if the base is bidirectional, we also allowed to do the opposite: replace the right with the left one.
  But replacing the right sentence with the left is illegal for unidirectional bases.

- Like before, we may perform sentence operations in the right side of the target statement.
  Like before, if the target is bidirectional, we may also perform it in its left sentence.
  But performing sentence replacement on the left sentence of a unidirectional target is illegal.

- The base's grade must be less-or-equal to that of the target's. Using a base with larger grade than the sentence's is illegal.


### Finish this, please. What is the last instruction?
The **Statement replacement** operation.
This has the same effect as two sentence replacements: one on the left sentence and one on the right.
In simple terms, it replaces **all** the occurrences of a sentence with its base-counterpart.

Back to our example: Our base was:
- ( x + y ) <----> ( y + x )
and our target was:
-  z + ( x + y ) ^ n - ( x + y ) <--2--> ( x + y ) + 1

If we perform statement the replacement operation we get:
-  z + **( y + x )** ^ n - **( y + x )** <--2--> **( y + x )** + 1

All the occurrences of (x+y) are now replaced with (y+x).


### There are rules again, I guess...
Correct! The rules for the statement replacement are:

- Like before, we are allowed replace the **left** sentence of the base with its **right** one.
  Like before, if the base is bidirectional, we also allowed to do the opposite: replace the right with the left one.
  But replacing the right sentence with the left is illegal for unidirectional bases.

- For bidirectional targets, we may choose any statement as a base.
  But for unidirectional targets, one may use only base with larger grade than the target.
  Using a base with grade less-or-equals to the target is illegal.
  
  
### Finally! It is over. Any bonus points?
Yes! While building theorems, you may have multiple targets. In other words, multiple statements that you just generated and working on.
We don't have to be limited to have 1 at a time.
One may use the one of those temporary statements as a base to perform operations into the others.

At the end of the theorem-building process, we may chose one (or more) of those statements to be permanently saved as theorems.
Please note that the theorem building process is also called a **proof** in MathAsm.