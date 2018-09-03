<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# Composition with conductor actions

## Action composition

The example in [Sequences](wskdeploy_sequence_basic.md#sequences) showed how to create a sequence of actions. Sequences are a simple form of composition, where a list of actions is composed into a larger action with the following characteristics:
- The success output of each action is transformed into the input of the next action in the sequence,
- The input of the full sequence is the input to the first executed action,
- The output of the full sequence is the output from the last executed action,
- If any action returns an error, the sequence stops and the error is returned immediately.

In practice, a sequence mimics the behaviour of the UNIX pipe operator (`|`). This is great but it has limitations. In particular, some standard programming constructs that you cannot implement with a sequence include:
- decision logic (if/then/else or loops),
- error recovery (try/catch),
- parameter retention, where some of the parameters given to an upstream action are also required by a downstream action and need to be retained.

OpenWhisk implements compositions through a special type of actions called conductor actions that orchestrate other actions and handle parameter transformation between those.

As a use case, assume that we want to perform a smart hello: if we have the `children` and `height` parameters, call the `hello_plus.js` action, otherwise call the `hello.js` actions. In both cases, ensure the `name` and `place` parameters are given default values.

### Manifest file
#### _Example: conductor action_
```yaml
packages:
  hello_conductor_package:
    version: 1.0
    license: Apache-2.0
    actions:
      hello_world:
        function: src/hello.js
      hello_plus:
        function: src/hello_plus.js
      hello_conductor:
        function: src/hello_conductor.js
        conductor: true
```

The key points of this file are:
- the `hello_world` and `hello_plus` actions are defined as normal and re-use code we created before,
- a third action, `hello_conductor` is defined with the `conductor` field set to `true`.

Conductor actions are called differently by OpenWhisk, which is why they need an explicit flag. Processing works as follows:
1. The conductor action is called;
2. If the result of the conductor action contains an `action` field:
    - Result fields `params` and `state` are expected to contain objects and the `state` object is saved by OpenWhisk;
    - The action referenced by `action` is called and given the `params` object as input;
    - The output of the action is merged with the `state` object and processing goes back to step 1 with this merged object as input.
3. Otherwise, processing ends and the result is returned.

### Conductor action file
#### _Example: conductor action_
```javascript
function main(params) {
    const step = params.$step || 0;
    switch(step) {
        case 0:
            const name = params.name || 'stranger';
            const place = params.place || 'Earth';
            if(params.children && params.height) {
                return {
                    action: 'hello_plus',
                    params: {
                        name: name,
                        place: place,
                        children: params.children,
                        height: params.height
                    },
                    state: {
                        $step: 1
                    }
                }
            } else {
                return {
                    action: 'hello_world',
                    params: {
                        name: name,
                        place: place
                    },
                    state: {
                        $step: 1
                    }
                }
            }
        default:
            delete params.$step;
            return params;
    }
}
```

The `state` field is used to carry a `$step` field between invocations. This step defaults to 0 if not provided. The action then returns different structures depending on the step value and within the handling of step 0 it returns a different `action` field if the `children` and `height` field are provided, in effect implementing a simple if/then/else logic.

### Deploying

You can actually deploy the "Conductor" manifest from the incubator-openwhisk-wskdeploy project directory if you have downloaded it from GitHub:

```sh
$ wskdeploy -m docs/examples/manifest_hello_world_conductor.yaml
```

### Invoking
You can invoke the simple version as follows:

```sh
$ wsk action invoke hello_conductor_package/hello_conductor -p name World -b
```

Or the plus version by giving additional parameters:

```sh
$ wsk action invoke hello_conductor_package/hello_conductor -p name Bilbo -p place Shire -p children 2 -p height 3 -b
```

### Result
The invocation should return a 'success' response that includes this result in the former case:

```json
{
    "greeting": "Hello World from Earth!"
}
```

And it should return a 'success' response that includes this result in the latter case:

```json
{
    "details": "You have 2 children and are 3 m. tall.",
    "greeting": "Hello, Bilbo from Shire"
}
```

### Discussion

Conductor actions make it possible to construct very complex action compositions. However, writing those actions is error prone and it is very easy to write infinite loops by forgetting to deal with the `state` field properly. The code in those actions can also be difficult to understand.

### Source code
The source code for the manifest and JavaScript files can be found here:
- [manifest_hello_world_conductor.yaml](examples/manifest_hello_world_conductor.yaml)
- [hello.js](examples/src/hello.js)
- [hello_plus.js](examples/src/hello_plus.js)
- [hello_conductor.js](examples/src/hello_conductor.js)

### Specification
For convenience, the Packages and Actions grammar can be found here:
- **[Packages](../specification/html/spec_packages.md#packages)**
- **[Actions](../specification/html/spec_actions.md#actions)**

---
<!--
 Bottom Navigation
-->
<html>
<div align="center">
<table align="center">
  <tr>
    <td><a href="wskdeploy_apigateway_http_sequence.md#api-gateway-http-response-and-sequence">&lt;&lt;&nbsp;previous</a></td>
    <td><a href="programming_guide.md#guided-examples">Example Index</a></td>
    <!--<td><a href="">next&nbsp;&gt;&gt;</a></td>-->
  </tr>
</table>
</div>
</html>
