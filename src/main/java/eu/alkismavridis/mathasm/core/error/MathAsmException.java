package eu.alkismavridis.mathasm.core.error;

import org.jetbrains.annotations.NotNull;

import java.util.HashMap;
import java.util.Map;

/**
 * Our core exception object.
 * It has 2 main concepts: code, and params.
 *
 * code represents an Enum. The enum is called ErrorCodes. The code represents what happened (example: USER_NAME_ALREADY_EXISTS)
 * Every code has its own parameters. The parameters will provide more details about the situation (example: userIdWIthThisName:"Roja")
 * Most codes probably will not need params. This is totally fine
 * */
public class MathAsmException extends Exception {

    //region FIELDS
    ErrorCode code;
    Map<String, Object> params;
    //endregion




    //region CONSTRUCTORS AND BUILDERS
    public MathAsmException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public MathAsmException(ErrorCode code) {
        super(code.name());
        this.code = code;
    }

    /**
     * adds a parameter to this exception. This function is null-safe for params, so it can be used any time.
     * null values are totally fine, too.
     * Just one important rule: no null keys.
     * */
    public MathAsmException addParam(@NotNull String key, Object value) {
        if (key==null) return this;

        if (this.params==null) this.params = new HashMap<>();
        this.params.put(key, value);
        return this;
    }
    //endregion


    public ErrorCode getCode() {
        return code;
    }


    //region OVERRIDES
    public Map<String, Object> getExtensions() {
        Map<String, Object> ret = new HashMap<>(1);
        ret.put("code", code.getValue());
        ret.put("name", code.name());
        if (this.params!=null) ret.put("params", this.params);
        else ret.put("params", new HashMap<>());
        return ret;
    }
    //endregion
}
