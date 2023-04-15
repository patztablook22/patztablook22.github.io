---
layout: post
title:  "Quantum computing with Jaq"
date:   2023-03-20 01:45:01 +0100
---

Jaq is a Quantum computing engine for Java that focuses on usage simplicity
and modularity. It provides an abstraction of a quantum computer, the
Quantum Virtual Machine (QVM). Quantum circuits can be then run indpedendently
of the underlying QVM implementation. I have written a quantum computer
simulator that uses sparse linear algebra.

For details, see the project [repository](https://github.com/patztablook22/jaq).

{% raw %}

<p align="center">
<img src="https://github.com/patztablook22/jaq/raw/main/src/main/java/io/github/patztablook22/jaq/doc-files/jaq.png"
 style="padding: 2rem; height: 22em" />
</p>

## Lifecycle

Jaq is based on a simple life cycle:

1. Build a quantum circuit.
2. Choose a QVM (quantum virtual machine) backend.
3. Run the circuit.

```java
class Program {
  public static void main(String[] args) {
    
    // Step 1. Build a quantum circuit.
    var circ = new Qcircuit() {{
      hadamard(0);
      cnot(0, 1);
      measure(1, 0);
    }};
    
    // Step 2. Choose a QVM backend.
    Qvm backend = new SimpleSimulator();
    
    // Step 3. Run the circuit.
    byte[] measurements = backend.run(circ);
  
  }
}
```

## Quantum circuits

Jaq provides `Qcircuit`, a convenient API for design, inspection, and composition of Quantum circuits.

A compact way of defining a quantum circuit is using anynomous subclassing and the initializer block, like in the example above:

```java
var circuit = new Qcircuit() {{

  /* superposition */
  hadamard(0);
       
  /* entanglement */
  cnot(0, 1);

  /* measurement */
  measure(0, 0);
  measure(1, 1);

}};
```
 
For a more fine control, `Qcircuit` can be simply inherited by a named subclass, which can e.g. automate the construction of the quantum circuit based on some parameters:

```java
class MyCircuit extends Qcircuit {
  public MyCircuit(int qubits) {

    for (int i = 0; i < qubits; i++)
      hadamard(i);

    /* ... */

  }
}
```

The circuits can be then run on any implementation of the Quantum virtual machine. The QVM is an abstraction of a quantum computer. The backend implementing that abstraction can be a custom quantum computer, a simulator, or a quantum computer availble over a public service.

Jaq is designed to be as modular as possible. New backends can be implemented by easily by hand. It is possible to build application-specific quantum computing libraries based on Jaq, utilizing the flexible `Qcircuit` API.

Especially when debugging, it is often useful to see the quantum circuit's diagram. This can be done simply by:

```java
Qcircuit circ = /* ... */;
System.out.println(circ);
```

Output for the circuit in the example code:

```
q0:  ─H─┬───
q1:  ───+─M─
c0:  ═════╚═
```

Or a more complex circuit, with some nested subcircuits: 

```
q0:  ─H───────────────────┌──────────┐─
q1:  ─H─Rx─┬─X────────────┤0  Inner2 ├─
q2:  ─H────┊─┬────────M─X─┤1         ├─
q3:  ─H────+─+────────║─X─└──────────┘─
q4:  ─┌─────────────┐─║────────────────
q5:  ─┤0  InnerA... ├─║────────────────
c0:  ═╡0            ╞═║════════════════
c1:  ═└─────────────┘═╚════════════════
```

## QVM backends

Jaq quantum circuits are backend-agnostic. A `Qvm` implementation is expected to provide the full functionality of a quantum computer, constrained only by the resources available. Namely:

- Accepting circuits with any quantum nodes.
- Implicitly or explicitly inlining all nested subcircuits.
- Never modifying the given quantum circuits. All intermediate representations should be kept separately.
- Transpiling not directly supported (e.g. more complex) quantum operations into the backend's universal set.
- Optimizing the resulting flow graph.
- Caching it for efficient reuse.

## The simulator theory

The theory behind quantum computing is roughly available at many places online.
To get started, I recommend [Qiskit learn](https://qiskit.org/learn/).
However, as I figured, these resources go only as deep as 1 or 2 qubit
circuits. When implementing an actualy simulator, this is not nearly enough.

One of the challenges that I faced was the following. Consider a quantum
circuit with two qubits. The CNOT gate has a very simple formulation
as the unitary matrix:

\\[ \\mathop{CNOT} = \\begin{pmatrix} 1 &amp; 0 &amp; 0 &amp; 0 \\\\ 0 &amp; 1 &amp; 0 &amp; 0 \\\\ 0 &amp; 0 &amp; 0 &amp; 1 \\\\ 0 &amp; 0 &amp; 1 &amp; 0 \\\\ \\end{pmatrix}. \\]

The computation then consists of merely applying this operator on the quantum state vector:

\\[ \\ket{\\psi'} = \\mathop{CNOT} \\ket{\\psi}. \\]

However, this trivial case doesn't generalize to quantum circuits with more qubits. For example,
let's have a circuit with 10 qubits, and we want to flip the 4th qubit depending
on the 7th qubit. How does one achieves this? Should we mirror the matrix,
stretch it, fill it with zeros, and pray? 

The solution to this is to be sought in a bit deeper understanding
of linear algebra, especially of the tensor product and the Kronecker product.
The above 2-qubit \\( \\mathop{CNOT} \\) matrix can be expressed as:

\\[ \\mathop{CNOT} = \\ket{0} \\bra{0} \\otimes I_{2} + \\ket{1} \\bra{1} \otimes  \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} . \\]

A way to think about it may be as an implicit if condition simulated
using the Hilbert space basis. From the way
matrix multiplication works, the matrix \\( \\ket{a} \\bra{b} \\) matches 
the basis vector \\( \\ket{b} \\) on the input, and transforms it into
\\( \\ket{a} \\) on the output, i.e.

\\[ (\\ket{a} \\bra{b}) \\cdot \\ket{b} = \\ket{a} \\cdot \\braket{b\|b} = \\ket{a}. \\]

And in the case the wrong input basis vector is given, it returns the zero vector \\( \\mathbf{0} \\):

\\[ (\\ket{a} \\bra{b}) \\cdot \\ket{c} = \\ket{a} \\cdot \\braket{b\|c} = \\ket{a} \\cdot 0 = \\mathbf{0}. \\]

Moving a layer up, 
\\( \\ket{0} \\bra{0} \\otimes I_{2} \\)
applies the discussed "if condition" matching the 0 basis in the first qubit (and returning
it back) and it 
additionally ties (thanks to the Kronecker product) the conditioned identity operator on the second qubit to it. 
Similarly the matrix

\\[ \\ket{1} \\bra{1} \otimes  \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} ) \\]

applies the "if condition" matching the 1 basis in the first qubit (and returning
it back again) and ties the conditioned "swap" operator on the second qubit to it. 
Finally, by summing the two, we obtain the unitary CNOT matrix

\\[ \\mathop{CNOT} = \\ket{0} \\bra{0} \\otimes I_{2} + \\ket{1} \\bra{1} \\otimes  \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} . \\]

In our analogy, the first matrix in the addition is active if (and only if) the first
qubit is 0. In that case it leaves it, and it also leaves the second qubit
as it is. In case the first qubit is 1, the second matrix is activated.
It again keeps the first qubit as it is, but now, instead of keeping the other
qubit, it swaps it.

In case we want to swap the second qubit based on the first one,
we simply swap the kronecker product operands:

\\[ \\mathop{CNOT}' = I_{2} \\otimes \\ket{0} \\bra{0} + \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} \\otimes \\ket{1}\\bra{1}. \\]

Now, instead of "pattern-matching" on the first qubit, we do it on the second one,
and based on that, we either keep or swap the first qubit.

With this in mind, we are ready to generalize the CNOT gate to an arbitrary
number of qubits. First, suppose there are M other qubits between
the controlling qubit and the target one. We want the CNOT gate not to 
act on these at all. Well, then we use the Kronecker product to insert
the appropriate identity matrices into what we already know:

\\[ \\mathop{CNOT} = \\ket{0} \\bra{0} \\otimes I_{2^M} \\otimes I_{2} + \\ket{1} \\bra{1} \\otimes I_{2^M} \\otimes  \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} . \\]

\\[ \\mathop{CNOT}' = I_{2} \\otimes I_{2^M} \\otimes \\ket{0} \\bra{0} + \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} \\otimes I_{2^M} \\otimes \\ket{1}\\bra{1}. \\]

Here, we use the fact the identity matrix \\( I_2 \\) doesn't change the qubit it acts on and
that 
\\[I_2^{\\otimes M} = I_{2^M}. \\]

The final step to the complete formula is considering what to do, when
there are some L qubits before and N qubits after the ones we're focusing on. We
again want the CNOT gate not to act on them at all, so we again use the
identity matrix trick:

\\[ \\mathop{CNOT} = I_{2^L} \\otimes \\ket{0} \\bra{0} \\otimes I_{2^M} \\otimes I_{2} \\otimes I_{2^N} + I_{2^L} \\otimes \\ket{1} \\bra{1} \\otimes I_{2^M} \\otimes  \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} \\otimes I_{2^N}. \\]

\\[ \\mathop{CNOT}' = I_{2^L} \\otimes I_{2} \\otimes I_{2^M} \\otimes \\ket{0} \\bra{0} \\otimes I_{2^N} + I_{2^L} \\otimes \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} \\otimes I_{2^M} \\otimes \\ket{1}\\bra{1} \\otimes I_{2^N}. \\]

It's actually that simple! Still I found a bit frustrating
it's nowhere to find online. Moreover, one can use similar reasoning 
to find the general formulas for the other quantum gates too.

## Putting it to work

After lots of experimenting, I came to the conclusion the most efficient
way to actually implement all that linear algebra is using sparse arithmetic.
The reason for it is that the dimension of the underlying Hilbert space increases
exponentially with the number of qubits:

\\[ \\mathop{dim} H = 2^Q \\]

This already means we will run out of memory quite quickly when we
start approaching about 30 qubits, because the vector will be too big. But we also
need to have the transformation matrices, which are *quadratically* big! 

Luckily, most of the values in the matrices turn out to be 0. This can be used 
to store and manipulate only the nonzero entries of the matrices.
For all the operations needed (matrix-vector product, Kronecker product, 
matrix addition), this leads to *linear time complexity* with respect
to the number of nonzero entries.

In retrospect, it is quite obvious to me I should have used sparse arithmetic. 
But I wanted to be really sure of it
before I started writing the hundreds of lines of code it necessitates,
so I spent some time e.g. plotting various matrix histograms to see whether
it is indeed the optimal solution.

Having the sparse linear algebra implemented, we can just take
the CNOT formula that we discovered earlier:

\\[ \\mathop{CNOT} = \\ket{0} \\bra{0} \\otimes I_{2^M} \\otimes I_{2} + \\ket{1} \\bra{1} \\otimes I_{2^M} \\otimes  \\begin{pmatrix} 0 &amp; 1 \\\\ 1 &amp; 0 \\\\ \\end{pmatrix} , \\]

and directly translate it to code (it would be analogous for \\( \\mathop{CNOT}' \\)):

```java
Ket cnot(Ket state, int controlQubit, int targetQubit, int totalQubits) {
    int l = controlQubit;
    int m = targetQubit - controlQubit - 1;
    int n = totalQubits - targetQubit - 1;

    val kernel = SparseOperator.basisKetbra(0, 0)
        .kronecker(SparseOperator.eye(1 << m))
        .kronecker(SparseOperator.eye(2))
        .add(SparseOperator.basisKetbra(1, 1)
                .kronecker(SparseOperator.eye(1 << m))
                .kronecker(SparseOperator.yey(2)));

    val operator = SparseOperator.eye(1 << l)
        .kronecker(kernel)
        .kronecker(SparseOperator.eye(1 << n);

    return operator.transform(state);
}
```

Voilà.

{% endraw %}
