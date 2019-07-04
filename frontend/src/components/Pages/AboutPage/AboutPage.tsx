import React, {Component} from 'react';
import "./AboutPage.css";

export default class AboutPage extends Component {
    //region RENDERING
    renderConnection(grade:number, isBidirectional:boolean) {
        return <div className="AboutPage_conn" style={{margin:"0 2px"}}>
            {isBidirectional? "<--" : "---"}
            {grade>0? grade : ""}
            {"-->"}
        </div>;
    }

    renderChapterSeparator() {
        return <div className="AboutPage_chapterSeparator"/>;
    }

    renderDefinition(title:String, content:any) {
        return (
            <div style={{margin:"10px"}}>
                <div style={{fontWeight:"bold"}}>Definition</div>
                <div className="AboutPage_definition">
                    <div className="AboutPage_definitionTitle">{title}</div>
                    {content}
                </div>
            </div>
        );
    }

    renderSentence(symbols:string[]) {
        return <div className="MA_flexStart" style={{marginTop:"8px"}}>
            {symbols.map((s,index) =>
                <div key={index} className="AboutPage_symbol" style={{margin:"0 8px"}}>{s}</div>
            )}
        </div>;
    }

    renderStatementFromSymbols(sen1:string[], grade:number, isBidirectional:boolean, sen2:string[], title?:string) {
        return <div style={{margin:"10px"}}>
            <div style={{fontWeight:"bold"}}>{title}</div>
            <div className="MA_flexStart" style={{marginTop:"8px"}}>
                {sen1.map((s,index) =>
                    <div key={index} className="AboutPage_symbol" style={{margin:"0 2px"}}>{s}</div>
                )}
                {this.renderConnection(grade, isBidirectional)}
                {sen2.map((s,index) =>
                    <div key={index} className="AboutPage_symbol" style={{margin:"0 2px"}}>{s}</div>
                )}
            </div>
        </div>;
    }

    renderStatement(sen1:any, grade:number, isBidirectional:boolean, sen2:any, title:string) {
        return <div style={{margin:"10px"}}>
            <div style={{fontWeight:"bold"}}>{title}</div>
            <div className="MA_flexStart" style={{marginTop:"8px"}}>
                {sen1}
                {this.renderConnection(grade, isBidirectional)}
                {sen2}
            </div>
        </div>;
    }



    render() {
        return (
            <div className="AboutPage_root">
                <div className="AboutPage_chapterTitle">1. What is MathAsm?</div>
                <div className="AboutPage_chapterContent">
                    <p>
                        MathAsm stands for <b>Math Assembly</b>.<br/>
                        It is a tool for building mathematical theories.<br/>
                        This can be done by defining axioms and using them to prove mathematical theorems or
                        philosophical premises.
                    </p>
                </div>
                {this.renderChapterSeparator()}


                <div className="AboutPage_chapterTitle">2. What does MathAsm try to offer?</div>
                <div className="AboutPage_chapterContent">
                    <p>
                        Every processor has an instruction set. A set of the things that one can do with it.
                        These are low level operations that one can use in order to write all sorts of programs.<br/>

                        MathAsm tries to do the same for Mathematics.<br/>
                        It defines a <b>set of operations</b> that one can perform in order to build any mathematical or philosophical theory.
                        Applying this "instruction set" on a mathematically sound statement will always produce an other
                        mathematically sound statements.<br/>

                        <b>In a nutshell, MathAsm aims to be for mathematics what assembly is for computer science.</b>
                    </p>
                    <p>
                        Additionally, MathAsm gives us the possibility to: .
                        <ol>
                            <li>Track down the dependencies between various theorems and axioms.</li>
                            <li>Answer questions like "on which axioms this theorem is based on"?</li>
                            <li>Answer question like "which theorems would be affected if I would remove/change this axiom"?</li>
                        </ol>
                        And more...
                    </p>
                </div>
                {this.renderChapterSeparator()}

                <div className="AboutPage_chapterTitle">3. Symbols</div>
                <div className="AboutPage_chapterContent">
                    <p>
                        The first basic concept of MathAsm is the <b>symbol</b>.
                    </p>
                    {this.renderDefinition("Symbol", "An unbreakable piece of text with no internal properties.")}

                    <p>
                        Symbols are the atoms that make the mathematical universe.
                        If we think of a mathematical theory as a language, symbols would be its words.
                        One can define as many symbol as needed in order to create a mathematical theory.<br/>

                        For example, if we would try to build the theory of boolean algebra, we would need to define symbols like:
                        <div className="MA_flexStart" style={{marginTop:"8px"}}>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>true</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>false</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>!</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>|</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>&</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>=</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>(</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>)</div>
                            and more...
                        </div>

                        <p>
                            A very important aspect of MathAsm is that <b>symbols do not have any semantic value or internal property</b>.<br/>
                            Symbols are no more than labels.<br/>
                            This is a core concept of MathAsm and there are no exceptions or special to it.<br/>
                        </p>
                        <p>
                            For example, the symbols
                            <div className="AboutPage_symbol" style={{margin:"0 8px", display:"inline-block"}}>&</div>
                            and
                            <div className="AboutPage_symbol" style={{margin:"0 8px", display:"inline-block"}}>=</div>
                            will be treated exactly the same by MathAsm.<br/>
                            The only thing that MathAsm will care about is that those are two <b>distinct</b> symbols.<br/>
                            That they are not the same.
                        </p>

                    </p>
                </div>
                {this.renderChapterSeparator()}


                <div className="AboutPage_chapterTitle">4. Sentences</div>
                <div className="AboutPage_chapterContent">
                    {this.renderDefinition("Sentence", "An ordered collection of symbols.")}
                    <p>Any positive number of symbols is called a sentence. For example:</p>

                    {this.renderSentence(["(", "true", "&", "false", ")", "|", "true"])}
                    <p>is a valid MathAsm sentence, assuming that every symbols on this sentence is defined.</p>

                    <p>
                        It is crucial to understand that MathAsm <b>does not define</b> a concept of "well formed", or "syntactically correct" sentences.<br/>
                        As far as MathAsm is concerned, any bunch of symbols is a sentence. For example the following is a valid sentence, as far as MathAsm is concerned:
                    </p>
                    {this.renderSentence([")", "false", "(", "=", "true", "false", "&", "=", "("])}

                    <p>
                        The rules of the proper syntax is defined by the axioms of each theory.<br/>
                        Then, the <b>instruction set</b> of MathAsm makes sure that every statement that started as a syntactically valid one,
                        stays that way after each operation applied to it.<br/>
                        More information on how this is done will follow soon.
                    </p>
                </div>
                {this.renderChapterSeparator()}

                <div className="AboutPage_chapterTitle">5. Connections and Statements</div>
                <div className="AboutPage_chapterContent">
                    <p>
                        One may think that the building blocks of mathematical theories (i.e. axioms and theorems) are sentences, as we defined them above.<br/>
                        After all, the following seems like a legitimate axiom of boolean algebra:
                    </p>
                    {this.renderSentence(["true", "=", "!", "false"])}

                    <p>
                        It may come as a surprise, but in MathAsm theorems and axioms are <b>not</b> sentences, but <b>statements</b>.<br/>
                        In this chapter, we will define what a statement is.
                    </p>

                    {this.renderDefinition(
                        "Statement",
                        <div>
                            Statement is a <b>pair of sentences</b>, bounded through a <b>connection</b>.<br/>
                            We say that statements have a <b>left side</b> (their first sentence) and a <b>right side</b> (their second sentence).<br/>
                            The connection of the sentence consists of a <b>grade</b> (a zero-or-positive integer) and a
                            <b>type</b> which is either <b>unidirectional</b> or <b>bidirectional</b>.
                        </div>
                    )}

                    <p>
                        So the structure is always: <b>statement 1</b> - <b>connection</b> - <b>statement 2</b>.<br/>
                        A statement essentially defines a <b>replace rule</b>:<br/>
                        two sentences that under certain circumstances can <b>replace</b> each other.<br/>
                        An example would be the sentences
                        <div className="MA_flexStart" style={{marginTop:"8px"}}>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>(</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>1</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>+</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>1</div>
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>)</div>
                            {this.renderConnection(0, true)}
                            <div className="AboutPage_symbol" style={{margin:"0 8px"}}>2</div>
                        </div>
                    </p>

                    <p>
                        The left part can replace the right part, and vice-versa.<br/>
                        This would be a bidirectional statement.<br/>
                        The instruction set that we talked about uses this concept of "replacement" to transform existing statements into new ones.
                        This way, we build new theorems based on axioms and older theorems.
                    </p>
                    <p>
                        Every theory defines its own replacement rules, which means its own axioms and theorems.<br/>
                        Those rules:
                        <ul>
                            <li>Give semantic value to the various symbols of the theory.</li>
                            <li>Define the correct syntax of the sentences of the theory.</li>
                            <li>Define what the theory is made of and ultimately, what is it about.</li>
                        </ul>
                    </p>

                    The graphical representation of a statement's connection will look like:
                    <div style={{display:"grid", gridTemplateColumns:"auto 1fr", gridGap:"10px 20px", alignItems:"center"}}>
                        {this.renderConnection(0, true)}
                        <span>Bidirectional connection, grade zero.</span>

                        {this.renderConnection(0, false)}
                        <span>Unidirectional connection, grade zero.</span>

                        {this.renderConnection(3, true)}
                        <span>Bidirectional connection, grade 3.</span>

                        {this.renderConnection(4, true)}
                        <span>Unidirectional connection, grade 4.</span>
                    </div>
                    <p>
                        The connection of the statement is an essential part of its <b>functionality</b>.
                        MathAsm uses connections in order to determine when a replacement can take place and when not.<br/>
                        When is it <b>legal</b> and when is it <b>illegal</b>.

                        <div className="AboutPage_infoBox">
                            The two <b>sentences</b> of a statement define what can replace what.<br/>
                            The <b>connection</b> of a statement defines when and how this may happen.
                        </div>
                        <p>More details on that will follow soon...</p>
                    </p>
                </div>
                {this.renderChapterSeparator()}


                <div className="AboutPage_chapterTitle">6. Defining symbols</div>
                <div className="AboutPage_chapterContent">
                    <p>
                        One may define as many symbols as desired.<br/>
                        The text representation of the symbol has to be:
                        <ul>
                            <li>Unique within the theory</li>
                            <li>At least one character long</li>
                            <li>Free of white-space characters. Most unicode characters will be allowed, though.</li>
                        </ul>
                    </p>
                </div>
                {this.renderChapterSeparator()}


                <div className="AboutPage_chapterTitle">7. Defining axioms</div>
                <div className="AboutPage_chapterContent">
                    <p>
                        Defining axioms is by nature an arbitrary process. There are no rules on what an axiom should contain.<br/>
                        Every theory is free to choose its own axioms, as desired.
                    </p>
                    <p>
                        The process is as simple as:
                        <ol>
                            <li>Form a sentence, by choosing any number of <b>symbols</b>, in any order. This will be the left side of the axiom.</li>
                            <li>Select the <b>grade</b> and the <b>type</b> of our axiom's connection.</li>
                            <li>Repeat step 1, to form the right side of the axiom.</li>
                            <li>Save the axiom.</li>
                        </ol>
                    </p>
                </div>
                {this.renderChapterSeparator()}

                <div className="AboutPage_chapterTitle">8. MathAsm moves</div>
                <div className="AboutPage_chapterContent">

                    {this.renderDefinition(
                        "MathAsm move",
                        <div>
                            An operation performed upon a statement that transforms it into a different statement.<br/>
                            MathAsm defines a set of such allowed transformations, which consist its <b>instruction set</b>.<br/>
                            Most of those moves are based on some existing statement, which we call the <b>base</b> of the move.
                        </div>
                    )}
                    <p>
                        On this chapter we will define the instruction set of MathAsm, which means all the possible moves that
                        can be performed upon statements.
                    </p>

                    <div className="AboutPage_subChapterTitle">8.1 Cloning</div>
                    <p>
                        This is how we start working on a new statement: we select an existing one and we make a clone of it.<br/>
                        We clone its sentences and its connection. <br/>
                        The existing statement we chose to clone is called the <b>base</b> of the move.
                    </p>
                    <p>
                        There are 3 types of cloning:
                        <ol>
                            <li>Statement cloning</li>
                            <li>Left sentence cloning</li>
                            <li>Right sentence cloning</li>
                        </ol>

                        In all 3 cases, the resulting statement wil have the same connection grade and type as the original one.<br/>
                        The difference of those 3 types is what the sentences of the statement will be.<br/>
                        Lets assume that we perform copy operations on the statement:
                        {this.renderStatementFromSymbols(["(", "1", "+", "1", ")"], 2, true, ["(", "3", "-", "1", ")"])}
                    </p>

                    <p>
                        In the <b>Statement cloning</b>, the resulting statement will be a perfect clone of the original:
                        its left sentence will be a copy of the original's left sentence, its right sentence will be a copy of the original's right sentence.
                        So the result will be:
                        {this.renderStatementFromSymbols(["(", "1", "+", "1", ")"], 2, true, ["(", "3", "-", "1", ")"])}

                    </p>
                    <p>
                        In the <b>Left sentence cloning</b>,
                        the resulting statement will have both of its statements being clones of the original's left statement.
                        The result will be:
                        {this.renderStatementFromSymbols(["(", "1", "+", "1", ")"], 2, true, ["(", "1", "+", "1", ")"])}

                    </p>
                    <p>
                        In the <b>Right sentence cloning</b>,
                        the resulting statement will have both of its statements being clones of the original's right statement.
                        The result will be:
                        {this.renderStatementFromSymbols(["(", "3", "-", "1", ")"], 2, true, ["(", "3", "-", "1", ")"])}

                    </p>

                    <div>Important:</div>
                    <div className="AboutPage_warningBox">
                        Right sentence cloning can be performed only with <b>bidirectional</b> bases.<br/>
                        Unidirectional statements can be cloned <b>only</b> by statement cloning or left cloning.
                    </div>

                    <div className="AboutPage_subChapterTitle">8.2 Single replacement</div>
                    <p>
                        Once we have initialize our statement, we can start transforming it by applying <b>replacing</b>
                        parts of its sentences with other sentences.
                        The simplest form of replacement is the single replacement.
                    </p>

                    {this.renderDefinition(
                        "Operation Target",
                        <div>
                            We define as <b>target</b> of a MathAsm operation,
                            the statement on which the operations is being performed.
                        </div>
                    )}

                    <p>
                        Lets assume that we have the following base and target:
                        {this.renderStatementFromSymbols(["( x + y )"], 0, true, ["( y + x )"], "Base")}
                        {this.renderStatementFromSymbols(["z + ( x + y ) ^ n - ( x + y )"], 2, true, ["( x + y ) + 1"], "Target")}
                    </p>
                    <p>
                        We see that the sentence <b>( x + y )</b> appears 3 times on the target statement: two times on its left sentence, and one time on its right.
                    </p>
                    <p>
                        By using single replacement, we can replace any one of those 3 with its counterpart: <b>( y + x )</b>
                        {this.renderStatement(
                            <div className="AboutPage_symbol">z + <span className="AboutPage_selected">( x + y )</span> ^ n - ( x + y )</div>,
                            2,
                            true,
                            <div className="AboutPage_symbol">( x + y ) + 1</div>,
                            "Target before replacement"
                        )}
                        {this.renderStatement(
                            <div className="AboutPage_symbol">z + <span className="AboutPage_replaced">( y + x )</span> ^ n - ( x + y )</div>,
                            2,
                            true,
                            <div className="AboutPage_symbol">( x + y ) + 1</div>,
                            "Target after replacement"
                        )}
                    </p>
                    <p>
                        Please note that the <b>base</b> was the one who defined that <b>( y + x )</b> could replace <b>( x + y )</b>.<br/>
                        We then used that base to transform our target statement.<br/>
                    </p>
                    <div className="AboutPage_infoBox">This process is the fundamental mechanism on how <b>new statements</b> are created based on <b>existing</b> ones.</div>

                    <p className="AboutPage_rulesBox">
                        <b>Rules on single replacement</b>
                        <ol>
                            <li>
                                We can replace the left sentence of the base with its right one. If the base is bidirectional, we can also replace the right with the left one.<br/>
                                Replacing the right sentence with the left is illegal for unidirectional bases.
                            </li>
                            <li>If the target is unidirectional, we can only edit its <b>right sentence</b>. Editing the left sentence of a unidirectional sentence is illegal.</li>
                            <li>The base must have <b>zero grade</b>. Using a base with larger grade for single replacement is illegal.</li>
                        </ol>
                    </p>

                    <div className="AboutPage_subChapterTitle">8.3 Sentence replacement</div>
                    <p>
                        Works similarly to the single replacement, but replaces <b>multiple occurrences at once</b>.<br/>
                        We choose one sentence of our target statement. Lets name this <b>target sentence</b>.<br/>
                        Performing the sentence replacement move will replace all the occurrences of the base sentence in our target sentence.<br/>
                        Lets see an example. Like before, we have the following base and target:

                        {this.renderStatementFromSymbols(["( x + y )"], 0, true, ["( y + x )"], "Base")}
                        {this.renderStatement(
                            <div className="AboutPage_symbol">z + <span className="AboutPage_selected">( x + y )</span> ^ n - <span className="AboutPage_selected">( x + y )</span></div>,
                            2,
                            true,
                            <div className="AboutPage_symbol"><span className="AboutPage_selected">( x + y )</span> + 1</div>,
                            "Target before replacement"
                        )}
                        {this.renderStatement(
                            <div className="AboutPage_symbol">z + <span className="AboutPage_replaced">( y + x )</span> ^ n - <span className="AboutPage_replaced">( y + x )</span></div>,
                            2,
                            true,
                            <div className="AboutPage_symbol"><span className="AboutPage_selected">( x + y )</span> + 1</div>,
                            "After replacement on the left sentence"
                        )}
                    </p>

                    <p>
                        We could have perform the move on the right sentence of our target. This would have resulted to:
                        {this.renderStatement(
                            <div className="AboutPage_symbol">z + <span className="AboutPage_selected">( x + y )</span> ^ n - <span className="AboutPage_selected">( x + y )</span></div>,
                            2,
                            true,
                            <div className="AboutPage_symbol"><span className="AboutPage_replaced">( y + x )</span> + 1</div>,
                            "Target after replacement on the right sentence"
                        )}
                    </p>
                    <p>
                        One may think that the sentence replacement is redundant, since one may perform a series of single replacements in order to achieve the same result.<br/>
                        The reason that we need to define explicitly this move is that single replacement is too strict.<br/>
                        One may perform sentence replacement in cases where single replacement would be illegal.<br/>
                    </p>

                    <p className="AboutPage_rulesBox">
                        <b>Rules on sentence replacement</b><br/>
                        <ol>
                            <li>
                                Similarly to single replacement, one may replace the left sentence of the base with its right one, or the right with the left one.
                                But the second is allowed only with bidirectional bases, and is illegal with unidirectional bases.
                            </li>
                            <li>Similarly to single replacement, if the target is unidirectional, we can only act on its <b>right sentence</b>. Editing the left sentence of a unidirectional sentence is again, illegal.</li>
                            <li>If the base has higher grade than the target statement, sentence replacement is illegal. Only bases with lower or equal grade as the target may be used.</li>
                        </ol>
                    </p>


                    <div className="AboutPage_subChapterTitle">8.4 Statement replacement</div>
                    <p>
                        Replaces all occurrences of the search sentence on both sentences of the target statement.<br/>
                        Has same effect as two sentence replacements, on both sentences of the target statement.
                        Lets see an example. Like before, we have the following base and target:

                        {this.renderStatementFromSymbols(["( x + y )"], 0, true, ["( y + x )"], "Base")}
                        {this.renderStatement(
                            <div className="AboutPage_symbol">z + <span className="AboutPage_selected">( x + y )</span> ^ n - <span className="AboutPage_selected">( x + y )</span></div>,
                            2,
                            true,
                            <div className="AboutPage_symbol"><span className="AboutPage_selected">( x + y )</span> + 1</div>,
                            "Target before replacement"
                        )}
                        {this.renderStatement(
                            <div className="AboutPage_symbol">z + <span className="AboutPage_replaced">( y + x )</span> ^ n - <span className="AboutPage_replaced">( y + x )</span></div>,
                            2,
                            true,
                            <div className="AboutPage_symbol"><span className="AboutPage_replaced">( y + x )</span> + 1</div>,
                            "After sentence replacement"
                        )}
                    </p>

                    <p>
                        Similarly to the case of sentence replacement, an explicit definition of the statement replacement move is not redundant.<br/>
                        Statement replacement can be used in cases where sentence replacement is forbidden, and thus, deserves its own place in MathAsm instruction set.
                    </p>

                    <p className="AboutPage_rulesBox">
                        <b>Rules on statement replacement</b><br/>
                        <ol>
                            <li>
                                Similarly to all other moves, one may replace the left sentence of the base with its right one, or the right with the left one.
                                But the second is allowed only with bidirectional bases, and is illegal with unidirectional bases.
                            </li>
                            <li>On unidirectional targets, one may use statement replacement <b>only</b> if the grade of the base is larger than the one of the target's.</li>
                        </ol>
                    </p>
                </div>
                {this.renderChapterSeparator()}


                <div className="AboutPage_chapterTitle">9. Proof procedure</div>
                <div className="AboutPage_chapterContent">
                    {this.renderDefinition(
                        "Proof",
                        "A series of MathAsm moves that will produce new theorems, based on the existing statements of the theory."
                    )}

                    <p>
                        On this chapter we will describe each one of the possible moves that one can perform in order to build theorems.<br/>
                        The collection of those moves is called <b>proof</b>.
                    </p>
                    <p>
                        Performing a proof in order to generate theorems goes like that:
                        <ol>
                            <li>
                                We start with a "pool" of statements. In the beginning of the theorem building process, the pool is empty.<br/>
                                This pool is our temporary workspace. Whatever we do here do not affect the theory and are visible only to us.
                            </li>
                            <li>We can initialize one or more statements on this pool, any time we want during the proof process. This is done by performing <b>cloning</b> moves.</li>
                            <li>We perform as many MathAsm moves we desire upon the initialized statements. Replacements, or more clonings.</li>
                            <li>
                                When we want to permanently store a statement from our pool to the theory, we perform a <b>save operation</b>.<br/>
                                This will generate an actual theorem, that will be a part of the theory, like all other statements that we used to produce it.<br/>
                                After performing a save operation, we can either end the process, or continue in order to store more theorems.
                            </li>
                        </ol>
                    </p>
                    <p>
                        The most common case is that the building process will end as soon as we save our first theorem.
                        Still, one may want to store 2 or more theorems that are created thourgh a single proof process.
                    </p>
                </div>
                {this.renderChapterSeparator()}


                <div className="AboutPage_chapterTitle">10. The theory structure</div>
                <div className="AboutPage_chapterContent">
                    <p>
                        Axioms and theorems can get pretty numerous. In fact, they can get extremely numerous.<br/>
                        This could quickly lead to mess when one tries to <b>locate</b> a theorem or axiom in an endless catalog of theorems.
                    </p>
                    <p>
                        In order to avoid this, MathAsm structures all generated statements in a <b>tree structure</b>,
                        similar to the file system of our computers.
                    </p>
                    <div className="AboutPage_infoBox">
                        MathAsm stores the statements of a theory inside directories.
                    </div>
                    <p>
                        Our computers have directories, and each directory can contain files and/or other directories.<br/>
                        Within each directory, each entry must have a unique name.
                    </p>
                    <p>
                        MathAsm does exactly the same, but instead of files, we have statements.<br/>
                        One may create directories inside the existing directories.<br/>
                        Every time a statement is being saved (axiom or theorem), the user must <b>assign a name to it</b> and
                        <b> specify</b> in which directory it must be stored.
                    </p>
                    <div className="AboutPage_infoBox">
                        Every MathAsm theory has a <b>root directory</b> when it is created.
                    </div>
                </div>
            </div>
        );
    }

    //endregion
}