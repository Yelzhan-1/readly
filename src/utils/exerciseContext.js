/** Resolve a personalised sentence for an exercise.
 *  Generators store it either nested (`context.contextPath`) or flat (`contextPath`). */

export function exerciseContext(ex) {
  if (!ex) return null;
  if (ex.context?.key) {
    return { path: ex.context.key, vars: ex.context.vars || {} };
  }
  if (ex.context?.contextPath) {
    return { path: ex.context.contextPath, vars: ex.context.contextVars || {} };
  }
  if (ex.contextPath) {
    return { path: ex.contextPath, vars: ex.contextVars || {} };
  }
  return null;
}
