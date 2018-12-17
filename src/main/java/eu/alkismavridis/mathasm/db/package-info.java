/**
 * Our NODE labels are:
 * - theory
 * - dir
 * - symbol
 * - stmt
 *
 * - proof
 * - move
 * - user
 *
 *
 * Our RELATIONSHIP labels are:
 * - FS (theory - dir)
 *
 * - DIR (dir -> dir)
 * - SYM (dir -> symbol)
 * - AUTH (dir -> user),  (stmt -> user), (symbol -> user)
 * - STMT (dir - stmt)
 * - PRF (stmt -> proof)
 * - MV (proof -> move)
 * */
package eu.alkismavridis.mathasm.db;
