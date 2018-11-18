package eu.alkismavridis.mathasm.api.utils

import eu.alkismavridis.mathasm.db.entities.User

/**
 * This object will be available through the whole query/mutation execution.
 * It contains information about the requesting user, the http status that will be returned, and more
 * */
class GraphqlContext {
    //region FIELDS
    var user: User? = null
    var httpStatus = 200
    //... more to come
    //endregion


    //region LIFE CYCLE
    constructor(user: User?) {
        this.user = user
    }
    //endregion


    //region ERROR MANAGEMENT
    fun setErrorStatus(status:Int) {
        if (this.httpStatus==200) this.httpStatus = status
    }
    //endregion
}