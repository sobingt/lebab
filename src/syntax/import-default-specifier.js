import BaseSyntax from './base';

/**
 * The class to define the ImportDefaultSpecifier syntax
 */
export default
class ImportDefaultSpecifier extends BaseSyntax {
  /**
   * @param {Identifier} local  The local variable where to import
   */
  constructor(local) {
    super('ImportDefaultSpecifier');
    this.local = local;
  }
}
