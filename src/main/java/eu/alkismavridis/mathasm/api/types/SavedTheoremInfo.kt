package eu.alkismavridis.mathasm.api.types

import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity

class SavedTheoremInfo(var parentId: Long, var theorem:MathAsmStatementEntity) {}