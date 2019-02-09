import MathAsmStatement from "./MathAsmStatement";
import MathAsmSymbol from "./MathAsmSymbol";

export default class MathAsmDir {
    id:number;
    name:string;

    statements:MathAsmStatement[];
    subDirs:MathAsmDir[];
    symbols:MathAsmSymbol[];
}