package eu.alkismavridis.mathasm.testtest

import java.util.*
import java.util.function.Consumer

class AITaskState {
    var input = 5
    var result:Int = 0

    var local1:Int = 0
}





//region SNIPETS
class AICodeSnipet(public val code: (AITaskState) -> Unit) {}

val snipets:List<AICodeSnipet > = listOf(
        AICodeSnipet { it.local1++ },
        AICodeSnipet { it.local1-- },
        AICodeSnipet { it.local1 = it.input },
        AICodeSnipet { it.result = it.local1 }
)
//endregion




//region TASK DESCRIPTION
val random = Random()
fun inputGenerator(state:AITaskState) {
    state.input = random.nextInt(1000)
}

fun judgeFunction(state:AITaskState) : Double {
    if (state.result==state.input+2) return 1.0
    else return -1.0
}
//endregion






//region TRAINER
var ai = listOf<Int>(2, 0, 0, 3)

fun trainAI(chunkSize:Int, attempts:Int) {
    for (attemptIndex in 0..attempts) {
        //TODO
    }
}
//endregion

