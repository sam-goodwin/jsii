using Amazon.JSII.Runtime.Deputy;

namespace Amazon.JSII.Tests.CalculatorNamespace
{
    /// <summary>
    /// awslabs/jsii#175
    /// Interface proxies (and builders) do not respect optional arguments in methods
    /// </summary>
    [JsiiTypeProxy(typeof(IInterfaceWithOptionalMethodArguments), "jsii-calc.InterfaceWithOptionalMethodArguments")]
    internal sealed class InterfaceWithOptionalMethodArgumentsProxy : DeputyBase, IInterfaceWithOptionalMethodArguments
    {
        private InterfaceWithOptionalMethodArgumentsProxy(ByRefValue reference): base(reference)
        {
        }

        [JsiiMethod("hello", null, "[{\"name\":\"arg1\",\"type\":{\"primitive\":\"string\"}},{\"name\":\"arg2\",\"type\":{\"primitive\":\"number\",\"optional\":true}}]")]
        public void Hello(string arg1, double? arg2)
        {
            InvokeInstanceVoidMethod(new object[]{arg1, arg2});
        }
    }
}