package eu.alkismavridis.mathasm.core.proof;

import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement;

@java.lang.FunctionalInterface
public interface TheoremGenerator {
    MathAsmStatement generate(MathAsmStatement selectedBase, byte side, boolean b);
}