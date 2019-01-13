### What the hell is this?
This project is a tool for building mathematical theories and/or philosophical propositions.
One can create statements from scratch (Axioms), or use existing statements to generate new statements (theorems) using **certain rules** of transformation.


### What theories?
Any theory. MathAsm does not care about the specifics of your theory.
You are may dealing with calculus, set theory, Lagrangian mechanics, Differential geometry, or creating your own crazy-nerdy stuff.
For MathAsm, these are all the same.

On the other side, you are maybe the philosophy-nerd type who want to prove/disprove the existence of God,
claim whether objective morality exists and so on.
MathAsm might be a tool for you too.


### How is it possible that MathAsm does not care about theory specifics?
MathAsm tries to see what all mathematical theories have in common, what is the basis of them all. MathAsm tries to focus on that and only that.
This applies in philosophical propositions, too (I guess).

A nice metaphor is the instruction set of a CPU: the instruction set does not care about the type of the applications you build.
The application depends on the instruction set, but not the other way around.
Thus, the instruction set does not care about the application specifics.
Also, note that the application can perform **only** the operations that the instruction set specifies.

Similarly, MathAsm specifies the structure and basic concepts for any theory without having to care about that theory's specifics.


### So, are you trying to define the instruction set of mathematics?
Kind of. In fact, MathAsm is more abstract than an instruction set. It could be compared to a Turing Machine.
If defines specifications: the structure of a theory, what a symbol is, an axiom and a theorem is, the rules that an instruction set should apply to in order to be considered MathAsm compliant.

On top of that, we can have instruction sets.
On this document and on this app, we also provide such an instruction set that we call **standard**, but generally speaking, MathAsm is not bound to one instruction set.
One could potentially try various instruction sets, which would lead to different kind of theories.
Various instruction sets are a huge topic. More info will follow soon...

### By the way, who are you? 
My name is Alkis Mavridis and MathAsm is an idea that I started developing about 10 years ago.
I am now building a web app (with the help of some amazing colleagues and friends!) in order to further illustrate the usage of MathAsm
and also use it as a tool for start "importing" existing mathematical and scientific theories into MathAsm, using a standard instruction set.

If this would be successful, one could even use it for demonstrating/exploring philosophical theories and their conclusions.
One could theoretically run political debates with MathAsm, For example, we could list commonly accepted assumptions
and explore in an structured and solid way the conclusions that those assumptions lead us to.


### Ok. Describe the basic principles of MathAsm in a nutshell.
So these are the golden rules.

1. Mathematical symbols have no internal properties or functionality. They are only labels and are all treated equally.
2. A sequence of such symbols is called a **sentence**.
3. Every Axiom and every Theorem is a **pair of sentences** with a **connection** that binds them together. This structure is called a **statement**.
The two sentences of a statement can be interpreted a replacement pair: theorems/axioms are basically two sentences that one can replace the other.
4. Theorems and Axioms have no internal properties or functionality. Just like symbols, they are all treated equally.
5. Creating an axiom is an arbitrary process: one constructs freely its two sentences by choosing any positive number symbols.
6. Creating theorems is a strict process. One start by cloning an **existing statement** and performs a number of specific,
well defined allowed moves that transform this statement into a new, different one. This new statement is called a theorem.
7. The set of the possible transformation that one may perform during theorem creation is called an **instruction set**.
8. As mentioned, every statement has a connection. Every instruction set defines the nature and properties of this connection.
This means that the connection of a statement contains all needed metadata that the instruction set needs in order to operate.
9. A MathAsm instruction set should **not** give any special handling to any symbol, sentence or statement.
This is the most important principle of MathAsm: no special handling exists on any symbol, sentence or statement. They are all equal.

In this document we will present an instruction that we will call the **standard** instruction set of MathAsm. This web app implements this instruction set, so that one can work with it.
The development of the standard instruction set is an ongoing process, but I think that it is mature enough to produce common mathematical theories, such as boolean algebra and arithmetic.

As mentioned above, each instruction set defines the nature and properties of each statement **connection**.
In the case of our **standard MathAsm instruction set** only two properties are needed: flow and grade.
More on that will be explained later on this document.

Please note that one might experiment with other MathAsm instruction sets and see where those lead
As long as those instruction sets operate on statements and respect the rules stated before, they can be called MathAsm instruction sets.


### Hey, that's to much at once! Enough with the nutshell. Explain MathAsm step by step now.
Ok, lets start from the basics.
The first important concept of MathAsm is the **symbol**. Symbols are like the atoms of the MathAsm universe.
Stuff that you cannot divide further into smaller pieces.
In mathematics, symbols would include stuff like:

1 2 3 + = ( ) sin cos

For philosophical propositions, symbols would be words.
Technical detail: symbols do not need to be one character. For example != (not-equals) is a symbol.
true and false would be symbols too. Note the sin and cos from the example above too. All of those are symbols.

Moving on. Every theory has its own symbols, so one is free to define as many as needed.
MathAsm does not define any symbol. MathAsm does not care about your theory specifics. Your theory will define its own symbols.

Oh, and the golden rule of symbols:
For MathAsm, symbols have **no meaning**, **no internal functionality** and are considered **all equal**.



### Whaaaat?? Do you mean that the symbol 1 and the symbol + are treated the same by MathAsm?
Exactly. MathAsm treats all symbols equally. No internal properties are assumed anywhere in MathAsm.
The only thing that MathAsm cares about is whether a symbol is the same as an other one or not.
For example, consider the sentence: 1 + 1 = 2

In this sentence, the first and the third symbol are the same symbol (1).
But the second symbol (+) is a different one.
MathAsm will recognize this fact. Besides that, symbols have no internal properties.
Not even a little bit. Nada, nic, niente. They are nothing more than a label. Got the idea?


### No! How can then anyone build meaningful theories like that? 1 cannot be the same as 2! How can I give them different meaning?
With axioms. Only Axioms give meaning to the symbols. But you are rushing a bit. We are not yet there.


### Ok, I see. Move to the next concept, please.
The next concept is the sentence. Sentence is any sequence of one-or-more symbols. Like:
- 1 + 1 = 2
- x + 2 = x - 2
- 5 * x
- ) 6 - ( x = / ( 55

Those are all valid sentences for MathAsm.


### I do not get it. How can those be valid sentences? The first one is ok. But the second one is wrong, the third states nothing, and the fourth looks more like my parrot walking on the keyboard than actual math.
MathAsm does not care about any of that. These are all valid sentences. And thus, your parrot can use MathAsm too.

### This has no sense! How can anyone build meaningful mathematical theories if we cannot distinguish proper from messed up syntax?
You can distinguish between good and bad syntax. You can have your well formed and malformed sentences.
But MathAsm will not do this distinction. Your axioms will. Your axioms define what correct syntax even means.

MathAsm makes sure that the theorems are direct result of your axioms. They are born by your axioms.
This means that theorems will have the same syntactical rules and patterns as the axioms you created. It will be just cause and effect.

So, here is how good syntax works: You make good syntax in your axioms, you get good syntax in your theorems.
Whatever good syntax means to you and your theory, anyway.

Oh, one important note: the order matters: the sentences 1+2 and 12+ are two different sentences.

### At least, something that sounds familiar. So, axioms and theorems are sentences, such as x=x, right?
No, axioms and theorems are not sentences. MathAsm could not work with sentences.


### I do not understand a word. What are axioms and theorems then?
This is our next concept: theorems and axioms are **statements**.


### What is a statement? Is it not the same as a sentence? Is it not a collection of symbols?
Not quite. A MathAsm Statement is a **pair of sentences**. Two sentences bound together.
Every axiom and every theorem in MathAsm is exactly that: a pair of sentences.
One sentence on its own is useless according to MathAsm. Only pairs can function.
Lets call those sentences **left part** and **right part** of the statement.


### What does this pairing mean?
Here is where the key point of MathAsm. A statement defines a pair of sentences **which can replace each other**.
The left can replace the right and be replaced by the right. Like you can replace the sentence (1+1) with the sentence (3-1),
and vice versa. Those two would be a statement, probably a theorem in the theory of Arithmetic.

So, based on this statement, you could transform the sentence (5 - (1+1)) into (5 - (3-1)).

According to MathAsm, replacing stuff with other stuff is the core functionality of all mathematics.
This is how new information is produced by combining existing information.
We just have to define which stuff may replace which stuff and then use these rules to produce our theorems.


### Sounds good. So, are we done?
Of course not.


### What comes next?
There is one last key concept. A very important one: the connection.
We said that a statement is a pair of sentences, bound together.
This bond (which we call a **connection**) has its own properties.
Each **MathAsm instruction set** may define the properties that it needs in order to function.
Those properties are integrated into each statement's connection.


### Ok, so, a statement consist of left part - a connection - and a right part?
Exactly. This is exactly the structure of a statement, the structure of every statement. No exceptions.
Every theorem and every axiom of every theory has this form.


### And what about the connection's properties? What properties does the standard instruction set defines?
In the standard instruction set, connections have just two properties: flow and grade.

The **flow** of a statement is one of the following: unidirectional or bidirectional.
One or the other. There is no third option.

The **grade** of a statement is a zero-or-more integer.

Just to clarify: both flow and grade are permanent features of theorems and axioms. Once a theorem/axiom is created
with unidirectional flow and grade 3, for example, it stays like that for ever. These properties are an organic part of the axiom or theorem and are equally important to the statement's sentences.

In this document, we will represent the connections like that:
- <--3-->  (bidirectional connection with grade 3)
- ---5-->     (unidirectional connection with grade 5)


### Got it. But what do those flows and grades do?
We will demonstrate this in detail when we will talk about the **standard MathAsm instruction set**.
But first, we will see how we define an **axiom**.


### So, building axioms. How is it done?
Building axioms is easy and messy. Here is how it goes.

- Form a sentence. Any sentence! Just put one or more symbols in order. As many as you wish, and whichever you wish. This will be the left part of your axiom.
- Chose your connection of the statement. This is related to the instruction set that you will use.
For the standard MathAsm instruction set, we will define a flow and a grade. We chose unidirectional or bidirectional as flow (whichever we like),
and a zero-or-more integer as grade (again, whichever we like).
- Repeat the step 1: form one more sentence with whatever symbols you want. This is the right part of the sentence.

That's it! We have an axiom.


### Wait... Do you mean that I can do anything I like?
Exactly! This is how you build axioms. You do anything you like, as long as it is a valid statement.
Building axioms is a total anarchy.

### Ok. And what about theorems?
Talking about the theorem building process means defining the MathAsm standard instruction set.
So, lets move ahead!

Here the picture is totally different than in axioms.
Building theorems is done under very strict rules.
In fact, the standard instruction set defines only 4 operations that we can perform.
You have to build all of mathematics with those 4. Everything else is forbidden.

One may perform as many of those "moves" as desired to build new statements based on the existing ones.
Once ready, we **save** the new statement into the theory, which means that it can no longer be transformed.
It is then called a **theorem**.


### Are you seriously suggesting that one can build all of mathematics with just 4 moves? What kind of moves are those anyway?
Yes, I claim that 4 moves are enough. So, lets see the first one.
It is called **cloning operation**.

You get an existing statement of the theory, theorem or axiom, and you copy it. You copy its sentences and its connection.

The one you chose to clone is called the **base** of the operation, and the resulting statement is the **target** of the operation.

The resulting statement will have the same flow and grade as the base, and its two sentences will be exact copies of the base's statements.
Simple and complete cloning.

### So is this how we start building new statements? By copying old ones?
Exactly. And this may indicate how the syntax pattern preservation that we mentioned before works.


### Ok. The second instruction?
The second is the **single replacement** operation.
We have a target (the statement that we will transform) and an existing statement that we will use as base.
Now assume that we found an **appearance** of the left statement of the base somewhere in the target.

The **single replacement** operation replaces this appearance with the right side of the base.
One could replace the right with the left, too.

For example, if we have the base:
-  ( x + y ) <----> ( y + x )

and we are working on the target:
-  z + ( x + y ) ^ n - ( x + y ) <--2--> ( x + y ) + 1

We see that the sentence **( x + y )** appears 3 times on the target: 2 times in its left sentence and 1 time on its right.
We choose one of them, lets say the second one of the left sentence. We then replace it with its base counterpart. This results to:
-  z + ( x + y ) ^ n - **( y + x )** <--2--> ( x + y ) + 1.

This is the single replacement operation.

### Seems easy. Can I always perform it?
No. Here are the conditions under which this operation can be performed:
- The **grade of the base** must be zero. Performing single replacement with a base of larger-than-zero grade is illegal.

- We are allowed replace the **left** sentence of the base with its **right** one.
  If the base is bidirectional, we also allowed to do the opposite: replace the right with the left one.
  But replacing the right sentence with the left is illegal for unidirectional bases. This is precisely what flow is meant to indicate, by the way.
  
- We may perform the single replacement operation in the right side of the target statement.
  If the target is bidirectional, we may also perform it in its left sentence.
  But performing single replacement on the left sentence of a unidirectional target is illegal.  


### Ok. What is the third instruction?
The **sentence replacement**. This works exactly like the single replacement, but replaces many occurrences at once.
All the occurrences in the chosen sentence of the target.

Back to our example: Our base was:
- ( x + y ) <----> ( y + x )
and our target was:
-  z + ( x + y ) ^ n - ( x + y ) <--2--> ( x + y ) + 1

If we perform a sentence replacement on the target's left sentence we will get:
-  z + **( y + x )** ^ n - **( y + x )** <--2--> ( x + y ) + 1

The right sentence stayed intact, since we performed the operation on the left sentence.
If we had chosen the right one, we would get:
-  z + ( x + y ) ^ n - ( x + y ) <--2--> **( y + x )** + 1.


### I get the point, but this looks redundant. Why making it a new instruction, we could repeat the single replacement more times to achieve the same result.
True. But the reason we need to explicitly define it is that single repetition has stricter rules.
There are situations that the single replacement is forbidden, but sentence replacement is allowed.
One may perform sentence replacement under the following conditions:

- The base's grade must not be necessary zero like before, be it must be less-or-equal than the target's. Using a base with larger grade than the target's is illegal.

- Like before, we are allowed replace the **left** sentence of the base with its **right** one.
  Like before, if the base is bidirectional, we also allowed to do the opposite: replace the right with the left one.
  But replacing the right sentence with the left is illegal for unidirectional bases.

- Like before, we may perform sentence operations in the right side of the target statement.
  Like before, if the target is bidirectional, we may also perform it in its left sentence.
  But performing sentence replacement on the left sentence of a unidirectional target is illegal.

### Ok. What is the last instruction?
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
  Using a base with grade less-or-equals than the target's one is illegal.
  
  
### Finally! This instruction set thing was long. Any bonus points?
Yes! While building theorems, you may work with multiple targets. In other words, multiple statements that you just generated and working on.
We don't have to be limited to have 1 at a time.
The cool part is that we can use each one of those temporary statements as a **base** to perform operations on the others.

At the end of the theorem-building process, we may chose one (or more) of those statements to be permanently saved as theorems.
Please note that the theorem building process is also called a **proof** in MathAsm.


### All right. But dude, you made those rules out of thin air! Why these rules are that way?
That is correct. The instruction set is arbitrary, kind of axiomatic.
As mentioned in the beginning, one of the goals of MathAsm is to find (at least) one instruction set
that is able to produce **any** valid statement and **only** valid statements.
With the assumption that we give valid axioms, of course.

As for the standard instruction set, this is such an attempt and has been through a lot of trial-and-error.
I have already build boolean algebra, arithmetic etc using it.
Still, its development is an ongoing process.

As mentioned before, there is not just one MathAsm instruction set: one could experiment with various ones.
If you want to propose/try alternative ones, you are most welcome to do so!
As long as it respects the basic rules of MathAsm described above, it can be called a MathAsm instruction set.

Trying various instruction sets can be considered its own field of study.

### What kind of trial and error did you go through?
I started with a very simplistic instruction set.
Every time I realized that my instruction was to limited, which means that it could not generate some mathematically valid statement, I had to expand it.
Every time I realized that my instruction set was too loose, which means that it could produce some invalid statements along with the valid ones, I had to make it stricter.


### Ok, ok. Tell me about how the current instruction set was born. What was your starting point?
I realized that all mathematical operation were stuff replacing other stuff.
So the idea of sentence pairs was born.
I just had to list which stuff could replace which other stuff, as axioms, and then I could
generate even more stuff to replace other stuff, as theorems!
My instruction set was only the single replacement, which was always allowed.

I did not even got the idea of the cloning move, yet. I would start the theorem's left part freely, like with axioms.
I would then force the right part to be equal to the left.

My starting points were, for example like: **(x+y)+z <----> (x+y)+z**

This was reflecting the fact the every sentence can replace itself and can be replaced by itself, because, you know, this has zero effect,
and thus is be definition allowed.

After that, I would start performing my single replacements and produce new statements.

For example, I had an axiom that said **(x+y) <----> (y+x)**,
and thus I could transform my statement like that: **(x+y)+z <----> (y+x)+z**

I was able to prove a couple of theorems this way (I was always building boolean algebra at the time).


### This looks much more logical than the mess you discribed above. So. Why did you abandon this instruction set?
Because it was stupid. Its first weakness was the flow. You see, some replacements are tricky.
Like possible values for a variable, for example.
Imagine that we are building boolean algebra.

We want to have axioms like **x <----> (true || x)**.

We also want to make clear that everything that we say for "x", holds for true and false two.
With other words, x can be replaced by true, or by false.

We want to prove, for example, based on the axiom above, that **false <----> (true || false)**

The only way to do that would be to create axioms that stated that x can be replaced by true or false:
- **x <----> false**  (axiom_of_doom_1)
- **x <----> true**  (axiom_of_doom_2)
 
And this was a total failure.


### Why? "false" can replace "x", so can "true". Those are also replacement rules. Where is the problem?
Because this meant that the opposite was also possible: x can be also replaced by "true".
Using the axioms above one could do:
- **x <----> (true || x)** (starting point)
- **x <----> (x || x)** (using axiom_of_doom_2)
- **x <----> (false || x)** (using axiom_of_doom_1)

So with those axioms, we may start with a nice, logical statement and end up in destruction and despair.


### What was the slippery point here?
The fact that you could jump from the specific to the general, in the same easiness and comfort that you jumped from the general to the specific.
Replacing x with true is jumping from general to the specific.
Replacing true with x is jumping from the specific to the general.
The second one cannot just happen like that.

So I solved this flow by introducing a different flow: the flow of the replacements.
For some statements, such as **x <----> true**, I wanted only one direction to be allowed.
One could jump from x to true, but not from true to x. axiom_of_doom_2 had now become **x ----> true** 
The idea of flow was born.

With its help, I could create a general -> specific hierarchy of concepts.


### Hm... Was this addition not enough?
No. I was still at the beginning.
The next weakness was again, being to tolerant.
Even by not allowing x to replace true and false, one could create chaos and nonsense.

Take our initial axiom for example: **x <----> (true || x)** (init_statement)
Lets say that we improved the axioms of doom to be unidirectional:

- **x ----> false**  (axiom_of_more_doom_1)
- **x ----> true**  (axiom_of_more_doom_2)

Notice now that x appears **two times** on init_statement.
With the current instruction set, we are free to replace the first time with true, and the second time with false.
These are two separate single replacements, each of them valid. So we get:

- **x <----> (true || x)** (starting point)
- **x <----> (true || true)** (using axiom_of_more_doom_2)
- **false <----> (true || true)** (using axiom_of_more_doom_1)

Once again, we turned the world up side down.


### What happened this time?
We failed to create the concept of the variable.
It is not enough to say that x can become true. We must enforce that all x become true simultaneously.
We cannot replace one occurrence of x with true and an other one with false. This ruins the concept of a variable.


### Ok, so you needed some of the replacements to be allowed individually, but others have to be grouped together.
Exactly. That was precise what leaded (after some more failed attempts) to the concept of **grade**.
The lower the grade of the base, the more individual replacements can be done.
Higher grades meant that those replacements had to expand into more occurrences.

The replacement from x to true or false had to be of grade 1, at least.
I then improved further my axioms to state:

- **x ---1--> false**  (axiom_1)
- **x ---1--> true**  (axiom_2)

They are not axioms of doom any more. Replacing an x meant that one had to replace all the x in a zero-based target.

I do not want to write a book here, but though this kind of trial and error attempts, I reached the instruction set
that I presented above.

As mentioned before, this may also have its flaws, and might be still improved.
The goal will be always the same: generate as many valid statements as possible, and only valid ones.


### Is that all?
This is pretty much all. When the application is ready, we will demonstrate specific theories (axioms + theorem proofs).
This way, the usage of MathAsm will become much more clear, that simply stating its rules.
Until then, we will be focusing on the development of the web app. This will contain a UI that will offer
a nice and smooth experience when building your axioms and theorems.
It would be also view all the proofs of the existing theorems. To see all the cool MathAsm stuff that generated each one of them.

### Any word for the app itself?
- Our Backend will be a spring-boot application written mostly in kotlin, with some Java parts.
- Our Database will be neo4j embedded.
- Our API will be exposed with GraphQL.
- Our frontend application will be powered by React.


### Any usage tips?
There is one more concept that the web app uses in order to avoid chaos.
You see, gathering many mathematical theories will inevitably cause the number of statements and symbols to explode.
To avoid this, we created a structure similar to your file system.

We create MathAsm "directories". Those can have subdirectories etc.
They can also contain statements and symbols.
This means that every symbol that is defined and every statement that is persisted, has to belong to a directory.

You can navigate though those directories in the same way you navigate to your file system, and view your statements and symbol
the same way you see your files.

But this directory concept does not affect the instruction set in any way.
One can use freely all symbols and all statements on a theory, no matter in which directory they belong to.
Directories are here only for organizing large numbers of symbols / statements.


### Can I use the app without signing in?
Yes. But you will have a read-only taste. You will be able to explore all the statements and symbols and view their proofs.
But you will not be able to create theorems, axioms etc.


### Can I contribute to MathAsm?
Yes! If you are a programmer, you could help us with the development of the web app.
If you are a math/philosophy type of person, you could import existing mathematical /philosophical theories
in MathAsm, or test the instruction set, even try different instruction sets.


### Can I fork the MathAsm webapp?
Sure you can! MathAsm is licensed under GPL 2.
As long as you comply to GPL 2 rules, you are totally free to do as you wish.


### I want to use the specification of MathAsm, or the ideas behind MathAsm on my work or presentation. Can I do so?
Sure! No matter if your work is pure hobby, academical, commercial, no matter if it is publicly available or private,
you may use MathAsm's rules and semantics as desired.
I will never, ever claim any financial or legal profit from your work.
The only condition that I ask is giving explicit credit to MathAsm and its creator on your work.