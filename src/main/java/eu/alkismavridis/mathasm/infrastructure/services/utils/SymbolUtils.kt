package eu.alkismavridis.mathasm.infrastructure.services.utils

import eu.alkismavridis.mathasm.entities.error.ErrorCode
import eu.alkismavridis.mathasm.entities.error.MathAsmException


private val WHITE_SPACE_REGEX = "\\s".toRegex()


class SymbolUtils {
    companion object {
        /**
         * removes leading and ending spaces.
         * Asserts that the result is not empty string and has no white spaces
         * */
        fun sanitizeSymbolTest(text:String) : String {
            var ret = text.replace(WHITE_SPACE_REGEX, " ")
            ret = ret.trim()

            if (ret.isEmpty() || ret.contains(WHITE_SPACE_REGEX)) {
                throw MathAsmException(ErrorCode.INVALID_SYMBOL_TEXT, "Invalid text: \"$text\".")
            }
            return ret
        }
    }
}
