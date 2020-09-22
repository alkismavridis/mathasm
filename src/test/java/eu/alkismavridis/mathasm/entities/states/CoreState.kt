package eu.alkismavridis.mathasm.entities.states

import eu.alkismavridis.mathasm.entities.sentence.MathAsmStatement

class CoreState {
    val statements = mutableMapOf<String, MathAsmStatement>()


    constructor() {
        //1. generate axioms
        var tmp = MathAsmStatement.createAxiom("axiom1", longArrayOf(2,4,2), longArrayOf(2,3,6,2), false, 2)
        tmp.id = 1
        statements["axiom1"] = tmp

        tmp = MathAsmStatement.createAxiom("axiom2", longArrayOf(1,1,1), longArrayOf(3), true, 0)
        tmp.id = 2
        statements["axiom2"] = tmp

        tmp = MathAsmStatement.createAxiom("axiom3", longArrayOf(5,5), longArrayOf(25,1), true, 1)
        tmp.id = 3
        statements["axiom3"] = tmp

        tmp = MathAsmStatement.createAxiom("axiom4", longArrayOf(2), longArrayOf(8, 8), true, 0)
        tmp.id = 4
        statements["axiom4"] = tmp

        tmp = MathAsmStatement.createAxiom("axiom5", longArrayOf(1, 1), longArrayOf(7, 8, 7), false, 0)
        tmp.id = 5
        statements["axiom5"] = tmp

        tmp = MathAsmStatement.createAxiom("axiom6", longArrayOf(2, 4, 2), longArrayOf(123, 456), true, 2)
        tmp.id = 6
        statements["axiom6"] = tmp
    }



    //region GETTERS
    fun getStatement(id:Long) :MathAsmStatement? {
        return statements.values.find { s -> s.id==id }
    }
    //endregion
}
