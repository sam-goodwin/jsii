import path = require('path');
import { TypeSystem } from '../lib';
import { diffTest } from './util';

let typesys: TypeSystem;

beforeEach(async () => {
  typesys = new TypeSystem();
  await typesys.loadModule(resolveModuleDir('jsii-calc'));
});

test('TypeSystem.hasAssembly', () => {
  expect(typesys.includesAssembly('@foo/bar')).toBeFalsy();
  expect(typesys.includesAssembly('jsii-calc')).toBeTruthy();
  expect(typesys.includesAssembly('@scope/jsii-calc-lib')).toBeTruthy();
});

test('TypeSystem.assemblies lists all the loaded assemblies', () => {
  return diffTest(typesys.assemblies.map(a => a.name).sort().join('\n'), 'assemblies.expected.txt');
});

test('TypeSystem.classes lists all the classes in the typesystem', () => {
  return diffTest(typesys.classes.map(c => c.name).sort().join('\n'), 'classes.expected.txt');
});

test('findClass', async () => {
  const calc = typesys.findClass('jsii-calc.Calculator');
  const actual = new Array<string>();
  calc.getMethods(/* inherited */ true).forEach(method => {
    actual.push(`${method.name} from ${method.parentType.name}`);
  });

  return diffTest(actual.join('\n'), 'findClass.expected.txt');
});

test('"roots" is a list of the directly loaded assemblies', async () => {
  await expect(typesys.roots.length).toBe(1);
  await expect(typesys.roots[0]).toBe(typesys.findAssembly('jsii-calc'));

  // now load another assembliy directly
  await typesys.load(resolveModuleDir('@scope/jsii-calc-lib'));
  return expect(typesys.roots.length).toBe(2);
});

describe('Type', () => {
  test('.isClassType', () => {
    // GIVEN
    const clazz = typesys.findFqn('jsii-calc.AllTypes');
    const iface = typesys.findFqn('jsii-calc.IPublicInterface');
    const enumt = typesys.findFqn('jsii-calc.AllTypesEnum');

    // THEN
    expect(clazz.isClassType()).toBeTruthy();
    expect(iface.isClassType()).toBeFalsy();
    expect(enumt.isClassType()).toBeFalsy();
  });

  test('.isDataType', () => {
    // GIVEN
    const clazz = typesys.findFqn('jsii-calc.AllTypes');
    const iface = typesys.findFqn('jsii-calc.IInterfaceThatShouldNotBeADataType');
    const datat = typesys.findFqn('jsii-calc.CalculatorProps');
    const enumt = typesys.findFqn('jsii-calc.AllTypesEnum');

    // THEN
    expect(clazz.isDataType()).toBeFalsy();
    expect(iface.isDataType()).toBeFalsy();
    expect(datat.isDataType()).toBeTruthy();
    expect(enumt.isDataType()).toBeFalsy();
  });

  test('.isInterfaceType', () => {
    // GIVEN
    const clazz = typesys.findFqn('jsii-calc.AllTypes');
    const iface = typesys.findFqn('jsii-calc.IPublicInterface');
    const enumt = typesys.findFqn('jsii-calc.AllTypesEnum');

    // THEN
    expect(clazz.isInterfaceType()).toBeFalsy();
    expect(iface.isInterfaceType()).toBeTruthy();
    expect(enumt.isInterfaceType()).toBeFalsy();
  });

  test('.isEnumType', () => {
    // GIVEN
    const clazz = typesys.findFqn('jsii-calc.AllTypes');
    const iface = typesys.findFqn('jsii-calc.IPublicInterface');
    const enumt = typesys.findFqn('jsii-calc.AllTypesEnum');

    // THEN
    expect(clazz.isEnumType()).toBeFalsy();
    expect(iface.isEnumType()).toBeFalsy();
    expect(enumt.isEnumType()).toBeTruthy();
  });

  describe('.extends(base)', () => {
    test('with interfaces', () => {
      // GIVEN
      const base = typesys.findFqn('@scope/jsii-calc-base-of-base.VeryBaseProps');
      const clazz = typesys.findFqn('jsii-calc.ImplictBaseOfBase');
      const enumt = typesys.findFqn('jsii-calc.AllTypesEnum');

      // THEN
      expect(base.extends(base)).toBeTruthy();
      expect(clazz.extends(clazz)).toBeTruthy();
      expect(clazz.extends(base)).toBeTruthy();
      expect(enumt.extends(base)).toBeFalsy();
      expect(base.extends(enumt)).toBeFalsy();
      expect(base.extends(clazz)).toBeFalsy();
    });

    test('with a class and an interface', () => {
      // GIVEN
      const iface = typesys.findFqn('jsii-calc.InterfaceImplementedByAbstractClass');
      const clazz = typesys.findFqn('jsii-calc.AbstractClass');

      // THEN
      expect(clazz.extends(iface)).toBeTruthy();
    });

    test('with two classes', () => {
      // GIVEN
      const base = typesys.findFqn('jsii-calc.AbstractClassBase');
      const clazz = typesys.findFqn('jsii-calc.AbstractClass');

      // THEN
      expect(clazz.extends(base)).toBeTruthy();
    });
  });

  describe('.allImplementations', () => {
    test('with an interface', () => {
      // GIVEN
      const base = typesys.findFqn('jsii-calc.InterfaceImplementedByAbstractClass');

      // THEN
      expect(base.allImplementations).toEqual([typesys.findFqn('jsii-calc.AbstractClass'), base]);
    });

    test('with an enum', () => {
      // GIVEN
      const enumt = typesys.findFqn('jsii-calc.AllTypesEnum');

      // THEN
      expect(enumt.allImplementations).toEqual([]);
    });
   });
});

function resolveModuleDir(name: string) {
  return path.dirname(require.resolve(`${name}/package.json`));
}
