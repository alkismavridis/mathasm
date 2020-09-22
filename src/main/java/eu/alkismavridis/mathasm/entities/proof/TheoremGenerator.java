package eu.alkismavridis.mathasm.entities.proof;

import eu.alkismavridis.mathasm.entities.sentence.MathAsmStatement;

@java.lang.FunctionalInterface
public interface TheoremGenerator {
    MathAsmStatement generate(MathAsmStatement selectedBase, byte side, boolean b);
}
