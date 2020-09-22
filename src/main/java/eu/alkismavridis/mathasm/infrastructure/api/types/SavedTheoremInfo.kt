package eu.alkismavridis.mathasm.infrastructure.api.types

import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmStatementEntity

class SavedTheoremInfo(var parentId: Long, var theorem:MathAsmStatementEntity) {}
