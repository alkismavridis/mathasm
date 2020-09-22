package eu.alkismavridis.mathasm.entities.proof;

import eu.alkismavridis.mathasm.entities.sentence.MathAsmStatement;

@FunctionalInterface
public interface TheoremSaver {
    void save(MathAsmStatement selectedBase, long parentId, String name);
}
