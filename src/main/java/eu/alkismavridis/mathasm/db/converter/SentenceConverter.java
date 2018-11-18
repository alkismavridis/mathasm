package eu.alkismavridis.mathasm.db.converter;

import eu.alkismavridis.mathasm.core.sentence.MathAsmSentence;
import org.neo4j.ogm.typeconversion.AttributeConverter;

public class SentenceConverter implements AttributeConverter<MathAsmSentence, long[]> {
    @Override
    public long[] toGraphProperty(MathAsmSentence phrase) {
        phrase.saveSpace();
        return phrase.getWords();
    }

    @Override
    public MathAsmSentence toEntityAttribute(long[] words) {
        return new MathAsmSentence(words, false);
    }
}