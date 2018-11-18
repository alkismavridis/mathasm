package eu.alkismavridis.mathasm.core.error;

import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MathAsmException extends Exception implements GraphQLError {

    //region FIELDS
    ErrorCode code;
    //endregion




    //region CONSTRUCTORS
    public MathAsmException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public MathAsmException(ErrorCode code) {
        super(code.name());
        this.code = code;
    }
    //endregion


    public ErrorCode getCode() {
        return code;
    }

    //region OVERRIDES
    @Override
    public List<SourceLocation> getLocations() {
        return null;
    }

    @Override
    public ErrorType getErrorType() {
        return null;
    }

    @Override
    public Map<String, Object> getExtensions() {
        Map<String, Object> ret = new HashMap<>(1);
        ret.put("code", code.getValue());
        return ret;
    }
    //endregion
}
