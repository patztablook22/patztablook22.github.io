---
layout: post
title:  "Tensor arithmetic with Matcha"
date:   2023-02-10 01:45:01 +0100
---

In my first university year, I was motivated by the lectures of Milan Straka,
an amazing teacher at MFF, to delve (deeper than I should have, in retrospect)
into the lower-levels of machine learning. Due to being a sperger when it comes
to blackboxes, I decided to start implementing my own Numpy/Tensorflow, fully
in C++, which I am going to introduce in this post.

For details, see the project [homepage](https://matcha-ai.github.io/matcha/).

{% raw %}

<img src="https://matcha-ai.github.io/matcha/media/img/matcha130.png"
 style="float: left; height: 8em; padding: 0 2rem;" />

Matcha is a framework for optimized tensor arithmetic and
machine learning. It features a very intuitive interface
inspired by Numpy and Keras. Matcha brings all this to C++.

It also provides a way to accelerate itself by Just-In-Time
inspecting and modifying the structure of given tensor functions
and compiling them into a set of instructions.  On top of that, Matcha delivers a dataset pipeline system, 
automatic differentiation system, and neural networks framework.

Due to its extent, I split Matcha into two semestral projects,
the first one dealing with most of the engine, while the other focused
on Tensorflow-like graphs.


```cpp
#include <iostream>
#include <matcha>

using namespace matcha;

int main() {
  Net net {
    nn::flatten,                             // flatten the inputs
    nn::Fc{300, "relu,batchnorm"},           // hidden layer
    nn::Fc{10, "softmax"}                    // output layer
  };

  Dataset mnist = load("mnist_train.csv");   // load the MNIST dataset
  net.loss = nn::Nll{};                      // use the negative log likelihood loss
  net.fit(mnist.batch(64));                  // fit the model

  tensor digit = load("digit.png");          // load a single digit image
  tensor probabilities = net(digit);         // make a prediction
  tensor result = argmax(probabilities);     // voila

  std::cout << "it is " << result << " with "
            << probabilities[result] * 100 << "% probability" << std::endl;
}
```

## Tensor arithmetic

Matcha provides a primitive-like type `tensor` to enable large-scale computations.
Tensors represent multidimensional arrays of data of a signle type (usually `Float`).


Creating a tensor can be as simple as:


```cpp
tensor a = 42;
```


We have just successfully created a tensor holding the scalar value 42.
But usually, we want to represent _much_ bigger data. For example, we may want to create
a 100x100 matrix with all values initialized to zero or to some custom values:

```cpp
tensor b = zeros(100, 100);
```

Tensors can be reassigned without a problem:

```cpp
tensor c = {{6, 8, 0, 2},
            {2, 0, 7, 1},
            {5, 2, 0, 9}};
c = uniform(100);
```

Tensor arithmetic is a core functionality of Matcha.
It is designed to be done very intuitively, much like in Numpy:


```cpp
tensor d;           // forward-declaration is possible too
d = a + b;
d = a * (b + 2i);   // complex numbers
d = power(2, -b);   // and so on...
```

Matcha implements also linear algebra operations and various operations
for composing tensors:


```cpp
d = transpose(b);   // transposition
d = b.t();          // transposition, but shorter
d = matmul(b, c);   // matrix multiplication
d = b.cat(c);       // concatenating b and c into one tensor
```

## JIT compilation

JIT is an easy-to-use tool for transforming dynamic programs into static ones.
It takes a native function (or lambda) that only accepts and returns tensors,
and gives back a reusable optimized version of that same function.

Roughly, this can be thought of as the difference
between writing a dynamic [PyTorch](https://pytorch.org/) code and 
building a static [TensorFlow](https://www.tensorflow.org/) graph.
Both have advantages and disadvantages. Dynamic code is easier to debug
and allows greater flexibility. Static graphs, on the other hand, are
completely language-agnostic and therefore very portable, and often allow
non-trivial optimizations for performance and memory. Matcha is designed
in a way that enables both frameworks and lets you decide which is better
for specific applications.

Consider the following function operating only on tensors:

```cpp
tensor foo(tensor a, tensor b) {
  tensor c = tanh(a);
  tensor d = matmul(a.t(), b);
  return exp(d - max(d));
}
```

To JIT it, simply call call `jit` on it. The higher-order function
`jit` returns the JITed version of the given tensor function. 
Next, we can use it simply as a usual function:

```cpp
int main() {
  // JIT foo
  auto joo = jit(foo);

  // prepare inputs
  tensor a = ones(50, 2);
  tensor b = uniform(50, 50);

  // we can now use `joo` instead of `foo`
  tensor c = joo(a, b);

  // voila
  std::cout << c << std::endl;
}
```

Output:

```txt
[[0.0115125   0.056408    0.0413443   ...  0.00737378  0.00350635  0.00479942  0.00427523 ]
 [0.0115125   0.056408    0.0413443   ...  0.00737378  0.00350635  0.00479942  0.00427523 ]]
```


### To JIT or not to JIT

**JIT** when:

- The function contains **many operations** operating on **big data**.
- The **overhead for operation initialization** is too large.
- The function has only **`tensor` external parameters** needed in runtime.

**Don't JIT** when:

- The function is not **performance-critical**.
- You want to **control the function flow**.
- You want to directly **access tensor buffers**.


### Jitting example

Suppose the following function:

```cpp
tensor foo(tensor a, tensor b) {
  using namespace std::complex_literals;

  tensor pl = a + b;
  tensor mi = a - b;
  tensor mu = a * b;
  tensor di = a / b;

  pl = pl.t();
  mi = mi.t();
  mu = mu.t();
  di = di.t();

  tensor c = matmul(pl, mi);

  tensor d = 2.71828;
  d *= -1i;

  return c * d;
}
```

JIT it:

```cpp
auto joo = jit(foo);
```

Building it for `Float[3, 3]` inputs produces **the following lambda**:

```txt
lambda(a: Float[3, 3], b: Float[3, 3]) -> Cfloat[3, 3] {
    c = Identity(b)
    d = Identity(a)
    e = Add(d, c)
    f = Subtract(d, c)
    g = Multiply(d, c)
    h = Divide(d, c)
    i = Transpose(e)
    j = Transpose(f)
    k = Transpose(g)
    l = Transpose(h)
    m = Matmul(i, j)
    o = Cast(n)
    q = Multiply(o, p)
    r = Cast(m)
    s = Multiply(r, q)
    t = Identity(s)

    return t
}
```

Lambda flow can be represented as a directed acyclic multigraph. In make case,
it will look like this:

<p class="center" style="filter: invert(96%);">
<img src="https://www.plantuml.com/plantuml/svg/NP513eCW44NtdCAbcdW1qpHjsaqNNRKNG46bHL4OclJsPPe9ehl9-myOyayEk0K_QiRoGskqiNMZlJoM9I_B8gkgOvQB8gkpcv0JAFZkjIPgxLPh2Sk2uGqq1-Kin9fsITfX-l0DMDx2glI9qgDoznhKh9CtXaGPKBcgZnAIuOD_g10-BP_SR5pW7V7NZlV4tpi-4DSxheYFOO5Nd7573gFNB9y86eGNxiA_3A5b-vSvOePNu6ZNGvPIjpsqHCmm-i_KpyZxK0KF5G5Mb5J3Jd8IeV8V" />
</p>


After passing through the lambda with the various optimizers,
it is **simplified into the following**:

```txt
lambda(a: Float[3, 3], b: Float[3, 3]) -> Cfloat[3, 3] {
    c = Add(a, b)
    d = Subtract(a, b)
    e = Matmul(c, d)
    f = Cast(e)
    h = Multiply(f, g)

    return h
}
```

Visualized as following:

<p class="center" style="filter: invert(96%);">
<img src="https://www.plantuml.com/plantuml/svg/VP0z2iCm38LtdSAZOyW5GWafdJlr1F9FqeAS54SUSljAuA4KqksXzxvlqBGp5gwP0EmbRBILmLDDetFeN6VwVZGsT6OmrnX_5_vhSKv7fH_LSy70vueeYj1oKkIEd2k1ykq8McYSjR_XBhgvjKsRSKahevYVQXPB9NwzwG2x_5i2J6cDyeOF">
</p>

Voilà, from 16 operations down to 5. That is **reduction by 69%**.

Still, both `foo` and `joo` should give the same output.
Let us try it:

```cpp
int main() {
  // Prepare the inputs
  tensor a = normal(3, 3); 
  tensor b = normal(3, 3);

  // Show the results
  std::cout << "foo:\n" << foo(a, b) << "\n\n"
            << "joo:\n" << joo(a, b) << std::endl;
}
```

Output:

```txt
foo:
[[0-18.5888i  0+23.8254i  0-8.41299i ]
 [0+8.33552i  0-0.151072i 0+1.56344i ]
 [0-14.3005i  0+21.7137i  0+2.17825i ]]

joo:
[[0-18.5888i  0+23.8254i  0-8.41299i ]
 [0+8.33552i  0-0.151072i 0+1.56344i ]
 [0-14.3005i  0+21.7137i  0+2.17825i ]]
```

# Automatic differentiation with Matcha

Matcha engine integrates a system for automatically computing _gradients_
(first order or higher order) of given tensors. It works via caching 
relevant operations performed on required tensors
and then [backpropagating](https://en.wikipedia.org/wiki/Backpropagation) 
through them. Note that Matcha backpropagation is fully compatible with 
Matcha function transformations like JIT.

`Backprop` is the main class for controlling backpropagation. Conceptually, it
roughly maps to [`tf.GradientTape`](https://www.tensorflow.org/api_docs/python/tf/GradientTape).
Instantiating `Backprop` makes the engine cache all performed operations for
later backpropagation:

```cpp
tensor a = 3;
tensor b = 2;

Backprop backprop;

tensor c = log(b * square(a) + a * 2);
```

Now, we can invoke the backpropagation by calling `backprop` and telling
it what tensor and with respect to (w.r.t.) which tensors to differentiate:

```cpp
// compute the gradients of `c` w.r.t. `a` and `b`
// and return std::map<tensor*, tensor>

auto gradients = backprop(c, {&a, &b});
```

The `gradients` variable now holds a map holding the computed gradients for
\\( \frac{\partial c}{\partial a} \\) and \\( \frac{\partial c}{\partial b} \\) .
Let us inspect these by simply iterating through the pairs in the map:

```cpp
for (auto&& [wrt, gradient]: gradients) {
  std::cout << "the gradient w.r.t. " << wrt << " is ";
  std::cout << gradient << std::endl;
}
```

The partial derivative with respect to a `a` and `b` should be:

\\[
\frac{\partial c}{\partial a} =
\frac{1}{\partial a} log(b a^2 + 2a) =
\frac{2ab + 2}{ba^2 + 2a} =
\frac{2 \cdot 3 \cdot 2 + 2}{2 \cdot 3^2 + 2 \cdot 3} =
\frac{14}{24} = 0.58\overline{3}
\\]


\\[
\frac{\partial c}{\partial b} =
\frac{1}{\partial b} log(b a^2 + 2a) =
\frac{a^2}{ba^2 + 2a} =
\frac{3^2}{2 \cdot 3^2 + 2 \cdot 3} =
\frac{9}{24} = 0.375
\\]


Correct! Our Matcha snippet produces the following output:

```txt
the gradient w.r.t. 0x7ffd2865a468 is 0.583333
the gradient w.r.t. 0x7ffd2865a470 is 0.375
```

### Example

Usually we want to differentiate much larger tensors, such
as matrices of neural network parameters.
The ability to have the gradients computed automatically is priceless
in machine learning. Suppose we have computed the gradients of some
loss function w.r.t. neural network parameters. We can then
perform a single SGD step simply like this:

```cpp
std::vector<tensor*> parameters = { ... };
tensor inputs, expected_result;   // suppose we got these from a dataset

Backprop backprop;
tensor outputs = neural_network(inputs);
tensor loss = loss_function(expected_result, outputs);

float learning_rate = 5e-3;

for (auto&& [param, gradient]: backprop(loss, parameters))
  *param -= learning_rate * gradient;
```

## Artificial Neural Networks

Matcha `nn` module implements common concepts used in artificial neural 
network machine learning. This includes `Layers`,
`Losses`, and `Optimizers`.
They can be assembled together to create fully functional machine learning
models. The class `Net` provides easy-to-use APIs for work with neural nets,
inspired by popular state-of-the-art frameworks like
[Keras](https://keras.io/) and [PyTorch](https://pytorch.org/):

- [Sequential](#sequential-api) API
- [Subclassing](#subclassing-api) API
- [Functional](#functional-api) API

After demonstrating each of these APIs, we will go through
[training](#training-neural-networks) neural networks and using them for
generating [predictions](#neural-network-predictions). 
Note however, that this guide is concerned with explaining the interface
and does not go into detail on _how to design neural networks_,
which can be found in [tutorials](tutorials/) (note: work in progress).

## Sequential API

Sequential API is the most straightforward one. It lets you build 
a neural net simply by declaring its layers in a single list:

```cpp
Net net {
  nn::flatten,               // flatten the inputs
  nn::Fc{100, "tanh"},       // one hidden tanh layer
  nn::Fc{1, "sigmoid"}       // binary classification output layer
};
```

Done! Now we can [train](#training-neural-networks) it.


This simplicity comes at a price. 
   The sequential API can only be used  to build nets with sequential
   topology. For more complex networks (e.g. with _residual connections_),
   use the functional or subclassing API.

## Subclassing API

Subclassing API, on the other hand, leaves you the most flexibility.
The trade-off for that is the most extra code. It works through inheriting
`Net` and overriding its protected virtual logic:

> `virtual Net::run(const tensor& a) -> tensor` \
> `virtual Net::run(const tensor& a, const tensor& b) -> tensor` \
> `virtual Net::run(const tensor& a, const tensor& b, const tensor& c) -> tensor` \
> `virtual Net::run(const tuple& inputs) -> tuple`

Single batch processing function.

> `virtual Net::init(const tensor& a) -> void` \
> `virtual Net::init(const tensor& a, const tensor& b) -> void` \
> `virtual Net::init(const tensor& a, const tensor& b, const tensor& c) -> void` \
> `virtual Net::init(const tuple& inputs) -> void`

Single batch processing function initialization - invoked exactly once,
before the first `Net::run` call. Accepts the same arguments as the
invoked `Net::run`.

> `virtual Net::trainStep(Instance i) -> void`

Customizable train step logic. By default, it performs one _forward_ and
_backward_ propagation using `Backprop`, 
emitting appropriate callback signals.

**Gotcha!** In contrast to static machine learning frameworks like 
   [TensorFlow](https://www.tensorflow.org/), which let you merely
   _declare_ the network topology through enumerating its components,
   Matcha allows more flexibility through dynamic flow. However, this
   means that all components that the neural net uses must be stored
   somethere so that they can be explicitly called later in your code.
   For example, instantiating and calling a layer all at once inside
   the `run` method **would not work as expected in TensorFlow**. Instead,
   a new layer would be created in each `run` invokation. Therefore,
   **you must instantiate all layers before calling `run`**, e.g. from `init`
   as private class members. 

An example will follow. We will create a custom `FcResNet` class using the
`Net` subclassing API. To demonstrate the flexibility of the subclassing
API, the `FcResNet` class will implement automatic _residual connection_
creation logic on fully connected [`nn::Fc`](nn/layers/fc) layers:

```cpp
class FcResNet : public Net {
  auto preprocessor = nn::Fc{100, "relu"};
  std::vector<unary_fn> residual_blocks;
  auto output = nn::Fc{10, "softmax"};

  void createResBlock();
  void init(const tensor& input) override;
  tensor run(const tensor& input) override;
};
```

Now, let's implement the methods. We will start by `createResBlock` logic.
There are many ways to do this. We will be using a value-capturing C++ lambda:

```cpp
void FcResNet::createResBlock() {
  unary_fn block = [
                      fc1 = nn::Fc{100, "relu"},
                      fc2 = nn::Fc{200, "relu"},
                      fc3 = nn::Fc{100, "none"}
                   ]
                   (const tensor& a) {
                     return fc3(fc2(fc1(a))) + a;
                   };

  residual_blocks.emplace_back(std::move(block));
}
```

Now, we will define the `init` function. We will let it create 3 residual blocks:

```cpp
void FcResNet::init(const tensor& input) {
  for (int i = 0; i < 3; i++)
    createResBlock();
}
```

And at last, we create the `run` function. Since we've done most of the
hard work in `createResBlock` and `init`, this function can merely 
sequentially call the stored residual blocks, with some pre-processing
and post-processing:

```cpp
tensor FcResNet::run(const tensor& input) {
  tensor feed = preprocessor(input);
  for (auto& block: residual_blocks)
    feed = block(feed);
  
  return output(feed);
}
```

That's it! We can proceed to instantiating our `FcResNet`:

```cpp
FcResNet net;
```

... and [training](#training-neural-networks) it.

## Functional API

The functional API is midway between the sequential and the subclassing API.
Use it when the network you want to create does not have a sequential 
topology but is still small enough. This can be done using a lambda or
by wrapping a normal function. We will make use of a C++ lambda with
C++ _static variables_ storing our layers (remember, Matcha is not _static_ itself!)
to create a simple net with one gated block, similar to those used in 
[recurrent neural networks](https://en.wikipedia.org/wiki/Recurrent_neural_network) (RNNs):

```cpp
Net net = [](tensor feed) {
  static auto fc1 = nn::Fc{100, "relu"};
  static auto fc2 = nn::Fc{100, "tanh"};
  static auto output = nn::Fc{10, "softmax"};

  feed = fc1(feed) * fc2(feed);
  return output(feed);
};
```

The network can now be [trained](#training-neural-networks).

## Training neural networks

Having our network logic declared, we can proceed to training it. 
We will to this in 4 steps.

### Step 1: Choose a loss function

First, we must choose a `Loss` function for our network. 
Loss functions set quantitative goals for artificial neural networks and
tell them how close or far they are. Choose your loss function based on 
what you expect from the network. Common losses are:

- `mse` - Mean Squared Error loss for **regression**-based tasks
- `nn::Nll` - Negative Log Likelihood wrapping binary and categorical
   distribution cross-entropies for **classification**-based tasks

... or, create your own loss! In Matcha, this is as simple as defining
a normal binary function, the first argument being the batch of `expected` 
outputs, the second argument being the batch of `predicted` outputs. Note
however, that the loss function **must be differentiable**.

Let's suppose we want to train a regressive model:

```cpp
net.loss = mse;     
```

### Step 2: Choose a neural network optimizer

The loss we have just chosen sets a goal for our neural network.
An `Optimizer` uses the gradients of that loss with respect to (w.r.t.)
our net's trainable parameters to minimize the loss and approach to 
the goal. By default, `Net` uses the stochastic
[Adaptive Moment Estimation (Adam)](https://arxiv.org/abs/1412.6980)
algorithm (`nn::Adam`), 
which has proven to be the most efficient for the 
vast majority of uses.
For this reason, we **can usually skip this step altogether**.

### Step 3: Prepare a dataset

This step may equally important to designing the entire neural net.
It involves collecting data from the internet or otherwise, formatting
it, and assembling it into a single dataset. We will show here only
how to import an already prepared dataset and perform some pre-processing.
For more, refer to the dataset documentation.

First, we have to load data from this disk. In this case, we will load the 
[Sklearn California housing](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html#sklearn.datasets.fetch_california_housing)
dataset from a `.csv` file. The dataset contains 20640 instances with
just 8 features and a single real-valued target for regression:

```cpp
Dataset california_housing = load("california_housing.csv");
std::cout << california_housing.size() << std::endl;            

// 20640
```

Next, we may want to make some adjustments to the dataset.
Notably, if every feature is represented as a separate scalar tensor,
we need to create a single input tensor by _mapping_ the dataset.
Dataset pipelines make it possible to work with huge amounts of data
(possibly billions of instances) in a memory-efficient manner:

```cpp
california_housing = california_housing.map([](Instance& i) {
  Instance mapped;
  mapped["y"] = i["Target"];
  mapped["x"] = stack(i["MedInc"],      // median income in block group
                      i["HouseAge"],    // median house age in block group
                      i["AveRooms"],    // average number of rooms per household
                      i["AveBedrms"],   // average number of bedrooms per household
                      i["Population"],  // block group population
                      i["AveOccup"],    // average number of household members
                      i["Latitude"],    // block group latitude
                      i["Longitude"]);  // block group longitude
  i = mapped;
});
```

Now when that's done, we have the training logic ready.

### Step 4: Fit!

Finally, we can fit our model. By default, the fitting process will be
logged by the `nn::Logger` net callback. To disable it, simply clear
the net's callbacks:

```cpp
net.callbacks.clear();
```

Alternatively, you can add more callbacks.

To fit our dataset, simply:

```cpp
net.fit(california_housing);
```

If we have the `nn::Logger` enabled, the fitting process will be reported:

![img](https://matcha-ai.github.io/matcha/nn/fit.gif)

We can specify the number of epochs the fitting algorithm shall perform:

```cpp
int epochs = 3;
net.fit(california_housing, epochs);
```

Alternatively, we can perform just one epoch explicitly
(equivalent to `epochs = 1`):

```cpp
net.epoch(california_housing);
```

If we want the most control over iterating through the dataset instances,
we can even schedule each training step individually:

```cpp
for (int i = 0; i < california_housing.size(); i++) {
  Instance i = california_housing.get();
  net.step(i);
}
```

## Neural network predictions

If we have designed the network correctly, it will be able to 
_generalize_ what it has been trained. This means we can now use it to 
predict novel data. In this sense, the `Net` class behaves as a completely
normal function. It accepts a batch of input data and returns a batch
of respective predictions:

```cpp
tensor data = load("novel_housnig_context.csv");
tensor pred = net(data);

std::cout << "Neural Network predictions are:" << std::endl;
std::cout << pred << std::endl;
```

Note that the neural network accepts _a batch_ of inputs,
   not a _single_ input. Confusing these two can lead to errors
   or non-sensical results. To easily convert a single `input` to
   a single-input batch, use the `stack` operation. This will expand
   the input dimensionality by batch axis while retaining the 
   original shape: \
   `tensor batched_input = stack(input);`


{% endraw %}
