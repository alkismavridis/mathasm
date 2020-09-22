package eu.alkismavridis.mathasm.infrastructure.api.types

import eu.alkismavridis.mathasm.infrastructure.db.entities.LogicMoveEntity
import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmStatementEntity
import java.util.stream.Collectors

class MathAsmProofWrapper {
    //region FIELDS
    var moves:MutableList<LogicMoveEntity>
    var bases: MutableCollection<MathAsmStatementEntity>
    //endregion


    constructor(moves:List<LogicMoveEntity>) {
        this.moves = moves.stream().collect(Collectors.toList())
        this.bases = mutableListOf()

        val baseMap = mutableMapOf<Long, MathAsmStatementEntity>()
        moves.forEach lit@{
            if(it.extBase==null) return@lit
            baseMap[it.extBase!!.id!!] = it.extBase!!
        }
        this.moves.sortBy {it.index}
        this.bases = baseMap.values
    }
}
