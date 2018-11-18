package eu.alkismavridis.mathasm.core.proof;

import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement;

@FunctionalInterface
public interface TheoremSaver {
    void save(MathAsmStatement selectedBase, long parentId, String name);
}