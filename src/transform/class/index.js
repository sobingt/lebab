import _ from 'lodash';
import estraverse from 'estraverse';
import PotentialClass from './potential-class';
import PotentialMethod from './potential-method';
import matchFunctionDeclaration from './match-function-declaration';
import matchFunctionVar from './match-function-var';
import matchPrototypeFunctionAssignment from './match-prototype-function-assignment';
import matchPrototypeObjectAssignment from './match-prototype-object-assignment';
import matchObjectDefinePropertyCall from './match-object-define-property-call';

export default function(ast) {
  const potentialClasses = {};

  estraverse.traverse(ast, {
    enter(node, parent) {
      let m;

      if ((m = matchFunctionDeclaration(node))) {
        potentialClasses[m.className] = new PotentialClass({
          name: m.className,
          constructor: new PotentialMethod({
            name: 'constructor',
            methodNode: m.constructorNode,
          }),
          fullNode: node,
          parent,
        });
      }
      else if ((m = matchFunctionVar(node))) {
        potentialClasses[m.className] = new PotentialClass({
          name: m.className,
          constructor: new PotentialMethod({
            name: 'constructor',
            methodNode: m.constructorNode,
          }),
          fullNode: node,
          parent,
        });
      }
      else if ((m = matchPrototypeFunctionAssignment(node))) {
        if (potentialClasses[m.className]) {
          potentialClasses[m.className].addMethod(new PotentialMethod({
            name: m.methodName,
            methodNode: m.methodNode,
            fullNode: node,
            parent,
          }));
        }
      }
      else if ((m = matchPrototypeObjectAssignment(node))) {
        if (potentialClasses[m.className]) {
          m.methods.forEach(method => {
            potentialClasses[m.className].addMethod(new PotentialMethod({
              name: method.methodName,
              methodNode: method.methodNode,
              fullNode: node,
              parent,
            }));
          });
        }
      }
      else if ((m = matchObjectDefinePropertyCall(node))) {
        if (potentialClasses[m.className]) {
          m.descriptors.forEach(desc => {
            potentialClasses[m.className].addMethod(new PotentialMethod({
              name: m.methodName,
              methodNode: desc.methodNode,
              fullNode: node,
              parent,
              kind: desc.kind,
            }));
          });
        }
      }
    },
    leave(node) {
      if (node.type === 'Program') {
        _(potentialClasses)
          .filter(cls => cls.isTransformable())
          .forEach(cls => cls.transform());
      }
    }
  });
}
