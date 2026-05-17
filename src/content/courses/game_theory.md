---
title: "Game Theory"
date: 2023-08-25T16:05:24+05:30
draft: false
math: true
tags: [Economics, Computer-Science, Math]
description: "Notes for CS6001 course"
resources:
- name: thumbnail
  src: 
toc: true
footer: true
---

## Game Theory

- **Game**
: It is a formal representation of the *strategic* interaction between *players*
- **Actions**
: *Choices* available to players
- **Strategy**
: *Mapping* from state of the game to set of valid actions

> **Normal Form**, **Extensive Form**, **Static**, **Dynamic**, **Repeated**, **Stochastic**, etc. are different kinds of games

- **Game Theory**
: It is the formal study of strategic interactions between player, who are *rational* and *intelligent*
- **Rational Player**
: A player who always picks the action that *maximizes* their *utility*
- **Intelligent Player**
: A player who knows the rules of the game *perfectly* and can pick the best action considering that there are other rational and intelligent players in the game
- **Common Knowledge**
: A *fact* is common knowledge if,
  - all players know the fact
  - all players know that all players know the fact
  - all players know that all players know that all players know the fact
  - $\dots$ ad infinitum

- **Game situations**($H$)
: Set of all finite sequence $(x_0, x_1,x_2,...,x_k)$ of board positions such that,
  - $x_0$ is the opening board position
  - $x_k\rightarrow x_{k+1}$
    - $k$ even $\implies$ single action of $W$
    - $k$ odd $\implies$ single action of $B$
- **Strategy** for $W$($s_W$)
: Function $s_W$ that associates every game situation $(x_0,x_1,x_2,...,x_k)\in H$, where $k$ is even, with a board position $x_{k+1}$ such that the move $x_k\rightarrow x_{k+1}$ is a single valid move for $W$
- **Strategy** for $B$($s_B$)
: Defined similarly as above
- **Outcome**
: Determined by a pair of $(s_W, s_B)$. Could be one of the following for chess,
  - $W$ wins: $W$ captures $B$ king
  - $B$ wins: $B$ captures $W$ king
  - Draw: Both players agree to draw
- **Winning Strategy** for $W$($s_W^\ast$)
: A strategy such that $\forall s_B$, the outcome for $(s_W^\ast,s_B)$ is a win for $W$
- **Draw Guaranteeing Strategy** for $W$($s_W^\prime$)
: A strategy such that $\forall s_B$, the outcome for $(s_W^\prime, s_B)$ is either a win for $W$ or a draw.

> **Theorem** : In chess, one and only one of the following statements is true
> - $s_W^\ast$ exists
> - $s_B^\ast$ exists
> - $s_W^\prime$ and $s_B^\prime$ exist

### Normal Form Games

#### Pure Strategies

**Static Game** $\langle N, \\\{S_i|i\in N\\\}, \\\{u_i | i\in N\\\} \rangle$
: A game where player interact only once
- **Set of players**
: $N =\\\{1,2,\dots,n\\\}$
- **Set of Strategies for $i$**
: $s_i\in S_i$
- **Strategy profile**
: $s=(s_1,s_2,\dots,s_n)\in S$
- **Set of strategy profiles**
: $S=\times_{i\in N}S_i$
- **Strategy profile w/o $i$**
: $s_{-i}=(s_1,\dots,s_{i-1},s_{s+1},\dots,s_n)$
- **Utility function for player $i$**
: $u_i:S\rightarrow \R$

> **Finite Game** : A static game where $\forall i\in N,\\ S_i$ is finite

##### Dominance

**Strictly Dominated Strategy**
: $s_i^\prime\in S_i,\\ \exists s_i\in S_i,\\ \forall s_{-i}\in S_{-i},\\ u_i(s_i, s_{-i})>u_i(s_i^\prime,s_{-i})$

**Weakly Dominated Strategy**
: $s_i^\prime\in S_i,\\ \exists s_i\in S_i,\\ \forall s_{-i}\in S_{-i},\\ u_i(s_i, s_{-i})\ge u_i(s_i^\prime,s_{-i})$ and $\exists \tilde s_{-i}\in S_{-i},\\ u_i(s_i, \tilde s_{-i}) > u_i(s_i^\prime, \tilde s_{-i})$

**Strictly Dominant Strategy**
: $s_i^\prime\in S_i, \forall s_i\in S_i-\\\{s_i^\prime\\\},\\ s_i$ is strictly dominated by $s_i^\prime$

**Weakly Dominant Strategy**
: $s_i^\prime\in S_i, \forall s_i\in S_i-\\\{s_i^\prime\\\},\\ s_i$ is weakly dominated by $s_i^\prime$

##### Equilibria

###### Dominant Strategy Equilibrium

**Strictly Dominant Strategy Equilibrium [SDSE]**
: A strategy profile $(s_1^\ast,s_2^\ast,\dots,s_n^\ast)$, such that $\forall i\in N,\\ s_i^\ast$ is a strictly dominant strategy

**Weakly Dominant Strategy Equilibrium [WDSE]**
: A strategy profile $(s_1^\ast,s_2^\ast,\dots,s_n^\ast)$, such that $\forall i\in N,\\ s_i^\ast$ is a weakly dominant strategy

> **Rational player never play dominated strategies.**
> So it can be useful to remove such strategies. 
> Strictly dominated strategies can be removed in any order.
> Weakly dominated strategies' order of removal matters as it can remove important outcomes.

###### Nash Equilibrium

**Pure Strategy Nash Equilibrium [PSNE]**
: A strategy profile $(s_i^\ast, s_{-i}^\ast)$ such that $\forall i\in N$ and $\forall s_i\in S_i$,
$$
  u_i(s_i^\ast, s_{-i}^\ast)\ge u_i(s_i,s_{-i}^\ast)
$$

**Best Response** ($B_i(s_{-i})$)
: $B_i(s_{-i}) = \\\{s_i\in S_i|\\ \forall s_i^\ast\in S_i,\\ u_i(s_i,s_{-i})\ge u_i(s_i^\ast,s_{-i})\\\}$

> For a PSNE $(s_i^\ast,s_{-i}^\ast)$, $s_i^\ast\in B_i(s_{-i}^\ast),\\ \forall i\in N$

> SDSE $\implies$ WDSE $\implies$ PSNE

##### Risk Aversion

**Max-Min Strategy** ($s_i^{\max\min}$)
: $s_i^{\max\min}\in\arg\max_{s_i\in S_i}\min_{s_{-i}\in S_i}u_i(s_i,s_{-i})$

**Max-Min value** ($\underline v_i$)
: $\underline v_i = \max_{s_i\in S_i}\min_{s_{-i}\in S_i}u_i(s_i,s_{-i})$

> $u_i(s_i^{\max\min},s_{-i})\ge\underline v_i,\\ \\ \forall s_{-i}\in S_{-i}$

> **Theorem** : $s_i^\ast$ is dominant strategy $\implies$ $s_i^\ast$ is a max-min strategy

> **Theorem** : Every PSNE $s^\ast=(s_1^\ast,\dots,s_n^\ast)$ satisfies $u_i(s^\ast)\ge\underline v_i,\\ \forall i\in N$

##### Elimination of dominated strategies

###### Preservation of Max-Min value

> **Theorem** : For NFG $G$, let $s_j^\prime\in S_j$ be a dominated strategy. Let $G^\prime$ be the residual game after removing $s_j^\prime$. Then, the maxmin value of $j$ in $G^\prime$ is equal to the maxmin value in $G$

###### Preservation of PSNE

> **Theorem** : For NFG $G$ and $G^\prime$ after elimination of **any** strategy, if $s^\ast$ is a PSNE in $G$ and survives in $G^\prime$, then $s^\ast$ is a PSNE in $G^\prime$ too.

> No new PSNE if eliminated strategy is dominated.
> Old PSNE could be killed.

##### Matrix Games

**Matrix Game**
: A NFG $\langle N, \\\{S_i|i\in N\\\}, \\\{u_i|i\in N\\\}\rangle$ with $N=\\\{1,2\\\}$ and $u_1(s)+u_2(s)=0,\\ \forall$ strategy profile $s\in S$

**Utility Matrix** ($U$)
: $[U]_{ij} = u_1(s_i,s_j)$

> Player 2's MaxMin value is negative of the column-wise MinMax of this matrix.

**Saddle Point**
: An element in the matrix that is maximum in it's column and minimum in it's row

> **Theorem** : In a Matrix game, $(s_1^\ast,s_2^\ast)$ is a saddle point $\iff$ $(s_1^\ast,s_2^\ast)$ is a PSNE

**Max-Min Value** ($\underline v$)
: $\underline v = \max_{s_1\in S_1}\min_{s_2\in S_2}U(s_1, s_2)$

**Min-Max Value** ($\bar v$)
: $\bar v = \min_{s_2\in S_2}\max_{s_1\in S_1}U(s_1, s_2)$

> **Lemma** : For matrix games, $\bar v\ge\underline v$

> **PSNE Theorem** : A Matrix game has a PSNE $\iff$ $\bar v=\underline v=U(s_1^\ast, s_2^\ast)$ where $s_1^\ast$ and $s_2^\ast$ are $\max\min$ and $\min\max$ strategies for player 1 and 2 respectively. $(s_1^\ast, s_2^\ast)$ is that PSNE.

#### Mixed Strategies

**Mixed Strategy Set** ($\Delta A$)
: $\Delta A = \\\{p:A\to[0,1]^{|A|}\\ |\\ \sum_{a\in A}p(a) = 0\\\}$

**Mixed Strategy** ($\sigma_i$)
: For player $i$, $\sigma_i:S_i\to[0,1]$ such that $\sum_{s_i\in S_i}\sigma_i(s_i)=1$

**Utility** ($u_i(\sigma_i,\sigma_{-i})$)
: $u_i(\sigma_i,\sigma_{-i}) = \sum_{s_1\in S_1}\sum_{s_2\in S_2}\cdots\sum_{s_n\in S_n}\prod_{j=1}^n\sigma_j(s_j)\cdot u_i(s_1,s_2,\dots,s_n)$

##### Mixed Strategy Nash Equilibrium

**MSNE**
: A mixed strategy profile $(\sigma_i^\ast, \sigma_{-i}^\ast)$ such that,
$$
  u_i(\sigma_i^\ast, \sigma_{-i}^\ast)\ge u_i(\sigma_i, \sigma_{-i}^\ast),\\ \forall\sigma_i\in\Delta S_i,\\ \forall i\in N
$$

> PSNE $\implies$ MSNE

> **Theorem** : $(\sigma_i^\ast, \sigma_{-i}^\ast)$ is an MSNE $\iff$ $\forall s_i\in S_i,\\ \forall i\in N$, 
> $$ u_i(\sigma_i^\ast,\sigma_{-i}^\ast)\ge u_i(s_i,\sigma_{-i}^\ast)$$

##### MSNE Characterization Theorem

**Support for Mixed Strategy** ($\delta(\sigma_i)$)
: $\delta(\sigma_i)=\\\{s_i\in S_i|\\ \sigma_i(s_i)>0\\\}$

> **Theorem** : $(\sigma_i^\ast,\sigma_{-i}^\ast)$ is a MSNE $\iff$ $\forall i\in N$,
> - $u_i(s_i,\sigma_{-i}^\ast)$ is identical $\forall s_i\in \delta(\sigma_i^\ast)$
> - $u_i(s_i,\sigma_{-i}^\ast)\ge u_i(s_i^\prime, \sigma_{-i}^\ast),\\ \forall s_i\sube \delta(\sigma_i^\ast),\\ s_i^\prime \not\in\delta(\sigma_i^\ast)$

- Maximizing w.r.t. a distribution $\Leftrightarrow$ Whole probability mass at max
$$ \max_{\sigma_i\in\Delta S_i}u_i(\sigma_i,\sigma_{-i})=\max_{s_i\in S_i}u_i(s_i,\sigma_{-i}) $$
- If $(\sigma_i^\ast, \sigma_{-i}^\ast)$ is an MSNE, then
$$ u_i(\sigma_i^\ast,\sigma_{-i}^\ast)=\max_{\sigma_i\in\Delta S_i}u_i(\sigma_i,\sigma_{-i}^\ast)=\max_{s_i\in S_i}u_i(s_i,\sigma_{-i}^\ast)=\max_{s_i\in\delta(\sigma_i)}u_i(s_i,\sigma_{-i}^\ast) $$

##### Algorithm for MSNE

For every support profile $X_1\times X_2\times\cdots X_n$ where $X_i\sube S_i$, solve the following feasibility program to get the MSNE,
$$
  w_i = \sum_{s_{-i}\in S_{-i}}(\prod_{j\not =i}\sigma_j(s_j))\cdot u_i(s_i,s_{-i}),\\ \forall s_i\in X_i,\\ \forall i\in N\\\
  w_i \ge \sum_{s_{-i}\in S_{-i}}(\prod_{j\not =i}\sigma_j(s_j))\cdot u_i(s_i,s_{-i}),\\ \forall s_i\in S_i\backslash X_i,\\ \forall i\in N\\\
  \sigma_j(s_j)\ge0,\\ \forall s_j\in S_j,\\ \forall j\in N\\\
  \sum_{s_j\in X_j}\sigma_j(s_j)=1,\\ \forall j\in N
$$

- Not linear unless $n=2$
- No poly-time algorithm for general game
- This is PPAD-complete (Polynomial Parity Argument on Directed graphs)

##### Existence of MSNE

**Finite Game**
: A game with finite number of players and each player has a finite set of strategies

> **Theorem** : Every finite game has a (mixed) Nash equilibrium.

#### Correlated Strategies

**Correlated Strategy** ($\pi$)
: A mapping $\pi:S_1\times S_2\times\cdots\times S_n\rightarrow[0,1]$ such that $\sum_{s\in S}\pi(s)=1$

**Correlated Equilibrium**
: A correlated strategy $\pi$ such that,
$$
  \sum_{s_{-i}\in S_{-i}}\pi(s_i,s_{-i})\cdot u_i(s_i, s_{-i})\ge \sum_{s_{-i}\in S_{-i}}\pi(s_i,s_{-i})\cdot u_i(s_i^\prime, s_{-i}),\\ \forall s_i,s_i^\prime\in S_i,\\ \forall i\in N
$$

To find a CE following linear equations must be solved,
$$
  \sum_{s_{-i}\in S_{-i}}\pi(s_i,s_{-i})\cdot u_i(s_i, s_{-i})\ge \sum_{s_{-i}\in S_{-i}}\pi(s_i,s_{-i})\cdot u_i(s_i^\prime, s_{-i}),\\ \forall s_i,s_i^\prime\in S_i,\\ \forall i\in N\\\
  \pi(s)\ge 0,\\ \forall s\in S,\\ \sum_{s\in S}\pi(s)=1
$$

> **Theorem** : For every MSNE $\sigma^\ast$ there exists a CE $\pi^\ast$

### Perfect Information Games

**Perfect Information Extensive Form Games** [PIEFG] $\langle N, A, H, X, P, (u_i)_{i\in N}\rangle$
: A game where players interact one after the other
- **Set of players**: $N$
- **Set of all possible actions**: $A$
- **Set of all sequences of actions**: $H$
  - empty history $\varnothing\in H$
  - if $h\in H$ and any sub-sequence $h^\prime$ of $h$ starting at the root then $h^\prime\in H$
  - $h=(a^{(0)},a^{(1)},\dots,a^{(T-1)})$ is **terminal** if $\nexists a^{(T)}$ such that $(a^{(0)},a^{(1)},\dots,a^{(T)})\in H$
  - **Set of terminal histories**: $Z\sube H$
- **Action set selection function**: $X:H\backslash Z\rightarrow 2^A$
- **Player function**: $P:H\backslash Z\rightarrow N$
- **Utility**: $u_i:Z\rightarrow\R$

**Strategy** ($S_i$)
: $S_i = \times_{\\\{h\in H:P(h)=i\\\}}X(h)$

> PSNE of PIEFG doesn't always give credible threats for equilibrium

#### Subgame Perfection

**Subgame**
: Subtree of a PIEFG $G$ rooted at a history $h$. It is the *restriction* of $G$ to the descendants of $h$.

**Subgame Perfect Nash Equilibrium** [SPNE]
: A strategy profile $s\in S$ such that $\forall$ subgame $G^\prime$ of $G$, the restriction of $s$ to $G^\prime$ is a PSNE of $G^\prime$

#### Backward Induction Algorithm

```python
def BACK_IND(history = []):
  if history in Z:
    return u(history),[]
  best_util = INT_MIN # -ve infinity
  for action in X(history):
    util_at_child = BACK_IND(history.append(action))[0]
    if util_at_child > best_util:
      best_util = util_at_child
      best_action = action
  return best_util, best_action
```

#### SPNE Limitations

**Advantages**
1. SPNE is guaranteed to exist in finite PIEFG
2. An SPNE is a PSNE
3. The algorithm to find SPNE is simple

**Disadvantages**
1. The whole tree needs to be parsed
2. Cognitive limit of real players may prohibit playing SPNE

### Imperfect Information Games

**Imperfect Information Extensive Form Games** [IIEFG] $\langle N,A,H,X,P,(u_i)_{i\in N},\\\{I_i:i\in N\\\}\rangle$
: A PIEFG with added condition that for every $i\in N,I_i=(I_i^1,I_i^2,\dots,I_i^{k(i)})$ is a partition of $\\\{h\in H\backslash Z:P(h)=i\\\}$ with the property that $X(h)=X(h^\prime)$ and $P(h)=P(h^\prime)=i$, whenever $\exists j, h,h^\prime\in I_i^j$
  - **Information Set** : $I_i^j\in I_i$ 

#### Behavioural Strategies

**Strategy Set** ($S_i$)
: For player $i$,
  $$S_i = \times_{j=1}^{j=k(i)}X(I_i^j)$$

> In NFGs mixed strategies randomized over pure strategies.
> In EFGs randomization can be done in different ways,
> - randomize over the strategies defined at the beginning of the game.
> - randomize over the action at an information set: behavioural strategy.

**Behavioural Strategies** ($b_i$)
: For player $i$,
  $$b_i:I_i\to\\\{\Delta X(I_i^j)\\ |\\ I_i^j\in I_i\\\}$$

#### Equivalence

**Equivalence**
: A mixed strategy $\sigma_i$ and a behavioural strategy $b_i$ of a player $i$ in an IIEFG are equivalent is $\forall \zeta_{-i}$, mixed/behavioural strategy of other players and for every vertex $x$ in the game,
$$
  \rho(x;\sigma_i,\zeta_{-i}) = \rho(x;b_i,\zeta_{-i})
$$

> It is enough to check only at the leaf nodes.
>
> **Theorem** : If $\sigma_i$ and $b_i$ are equivalent then $\forall\zeta_{-i}$,
> $$
>   u_j(\sigma_i,\zeta_{-i})=u_j(b_i,\zeta_{-i})\forall j\in N
> $$
>
> **Corollary** : Let $\sigma$ and $b$ be equivalent i.e. $\sigma_i$ and $b_i$ are equivalent $\forall i\in N$, then $u_i(\sigma)=u_i(b)$

Equivalence doesn't hold if the players are forgetful.

> **Theorem** : Consider an IIEFG such that every vertex has at least two actions. Every behavioral strategy has an equivalent mixed strategy for a player iff each information set of that player intersects every path emanating from the root at most once.

#### Perfect Recall

**Perfect Recall**
: For every $I_i^j$ of player $i$ and every pair of vertices $x,y\in I_i^j$, if the decision vertices of $i$ are $x_i^1,x_i^2,\dots,x_i^L=x$ and $y_i^1,y_i^2,\dots,y_i^{L^\prime}=y$ respectively for the two paths from the root to $x$ and $y$ then
  - $L = L^\prime$,
  - $x^l_i,y^l_i\in I_i^k$ for some $k$,
  - $a_i(x_i^l\to x_i^{l+1})=a_i(y_i^l\to y_i^{l+1}),\\ \forall l=1,2,\dots,L-1$.

**Perfect Recall Game**
: A game where every player has a **perfect recall**

> In a perfect recall game every behavioural strategy has equivalent mixed strategy.

$S_i^\prime(x)$
: The set of pure strategies of player $i$ at which he chooses actions leading to $x$

> **Theorem** : If $i$ is a player with perfect recall and $x$ and $x^\prime$ are the two vertices in the same information set of i, then $S_i^\ast(x) = S_i^\ast(x^\prime)$.
>
> **Kuhn Theorem** : In every IIEFG, if $i$ is a player with perfect recall then for every mixed strategy of $i$, there exists a behavioural strategy.

#### Bayesian Beliefs

**Beliefs** ($\mu_i^j:I_i^j\to[0,1]$)
: Distribution over an information set such that $\sum_{x\in I_i^j}u_i^j(x)=1$

**Bayesian Belief** ($\mu_i = \\\{\mu_i^1,\mu_i^2,\dots,\mu_i^{k(i)}\\\}$)
: When derived from a behavioral strategy $\sigma$ such that, $\forall x\in I_i^j,\forall j\in \\\{1, 2, \dots, k(i)\\\}$,
  $$\mu_i^j(x) = P_\sigma(x) / \sum_{y\in I_i^j}P_\sigma(y)$$

**Sequantial Rationality**
: A strategy $\sigma_i$ at an information set $I_i^j$ is sequentially rational given $\sigma_{-i}$ and partial belief $\mu_i^j$ if,
  $$\sum_{x\in I_i^j}\mu_i^j(x)u(\sigma_i,\sigma_{-i}|x)\ge\sum_{x\in I_i^j}\mu_i^j(x)u(\sigma_i^\prime,\sigma_{-i}|x)$$

> Sequential Rationality is a refinement on Nash Equilibrium.
> 
> **Theorem**: In PIEFGs, a behavioral strategy profile $\sigma$ is an SPNE iff the tuple $(\sigma, \hat\mu)$ is sequentially rational.
>
> Here $\hat\mu$ is the degenrate distribution since in PIEFGs all information sets are singleton.

**Perfect Bayesian Equilibrium** $(\sigma, \mu)$
: $\forall i\in N$,
  - $\mu_i$ is Bayesian w.r.t. $\sigma$
  - $\sigma_i$ is sequentially rational given $\sigma_{-i}$ and $\mu_i$

### Bayesian Games

**Bayesian Games** $\langle N, \\\{\Theta_i:i\in N\\\}, P, \\\{\Gamma_\theta:\theta\in(\times_{i\in N}\Theta_i)\\\}\rangle$
: - $N$ : Set of players
  - $\Theta_i$ : Set of types of player $i$
  - $P$ : Common prior distribution over $\Theta=\times_{i\in N}\Theta_i$
  - $\Gamma_\theta$ : NFG for type profile $\theta\in\Theta$ i.e. $\Gamma_\theta = \langle N,\\\{A_i(\theta):i\in N\\\},\\\{u_i(\theta):i\in N\\\}\rangle$ where $u_i:A\times\Theta\to\R$ and $A=\times_{i\in N}A_i\\ \forall\theta$

**Strategy**
: - Pure: $s_i:\Theta_i\to A_i$
  - Mixed: $\Theta_i\to\Delta A_i$

**Ex-ante Utility**
: Expected utility before observing own types,
  $$u_i(\sigma) = \sum_{\theta\in\Theta}P(\theta)u_i(\sigma(\theta);\theta)\\\
  \\ \\\
  \sum_{\theta\in\Theta}P(\theta)\sum_{(a_1,a_2,a_3,\dots,a_n)\in A}\prod_{j\in N}\sigma_j(\theta_j)[a_j]u_i(a_1,\dots,a_n;\theta_1,\dots,\theta_n)$$

**Ex-interim Utility**
: Expected utility after observing one's own type,
  $$u_i(\sigma|\theta_i)=\sum_{\theta_{-i}\in\Theta_{-i}}P(\theta_{-i}|\theta_i)u_i(\sigma(\theta);\theta)$$

#### Equilibria

**Ex ante Equilibrium** $(\sigma^\star,P)$
: Nash Equilibrium,
  $$u_i(\sigma^\star_i,\sigma^\star_{-i})\ge u_i(\sigma^\prime_i, \sigma^\star_{-i}),\forall\sigma_i^\prime,\forall i\in N$$

**Ex interim Equilibrium** $(\sigma^\star, P)$
: Byesian Equilibrium,
  $$u_i(\sigma_i^\star(\theta_i),\sigma_{-i}^\star|\theta_i)\ge u_i(\sigma_i^\prime(\theta_i),\sigma_{-i}^\star|\theta_i),\\ \forall\sigma^\prime_i,\forall\theta_i\in\Theta_i,\forall i\in N$$

> **Theorem**: In a finite Bayesian Game, a strategy profile is Bayeisan Equilibrium iff it is a Nash Equilibrium.
>
> **Theorem**: Every finite Bayesian game has a Bayesian Equilibrium.

## Mechanism Design

**General Model**
: - $N$ - set of players
  - $X$ - set of outcomes
  - $\Theta_i$ - set of private information of player $i\in N$
    - $\theta_i\in\Theta_i$ - a type of player $i$
  - Type can manifest in preferences over the outcomes in different ways:
    - Ordinal - $\theta_i$ defines an ordering over the outcomes
    - Cardinal - an utility function maps the an (outcomes, type) pair to real numbers
      - $u_i:X\times\Theta_i\to\R$ : private value model
      - $u_i:X\times\Theta\to\R$ : interdependent value model

**Social Choice Function** ($f$)
: $f:\times_{i\in N}\Theta_i\to X$

**Indirect Mechanism** $\langle M_1,M_2,\dots,M_N,g\rangle$
: - $M_i$ is the message space of player $i$
  - $g:M_1\times M_2\times\dots\times M_N\to X$

**Direct Mechanism** $\langle\Theta_1,\dots,\Theta_N, g\rangle$
: An indirect mechanism such that $M_i=\Theta_i,\\ \forall i\in N$

**Weak Dominance**
: For a message $m_i$ of player $i$ at $\theta_i$,
  $$u_i(m_i,m_{-i})\ge u_i(m_i^\prime,m_{-i}),\\ \forall m_i^\prime,\\ \forall m_{-i}$$

**Dominant Strategy Implementable [DSI]**
: An indirect mechanism that implements a SCF through dominance with,
  - $\exist s_i:\Theta_i\to M_i$ such that $s_i(\theta_i)$ is a dominant strategy for player $i$ at $\theta_i,\\ \forall\theta_i\\ \forall i\in N$
  - $g(s_1(\theta_1),\dots,s_N(\theta_N))=f(\theta),\\ \forall\theta\in\Theta$

**Dominant Strategy Incentive Compatible [DSIC]**
: A direct mechanism such that,
  $$u_i(g(\theta_i,\theta_{-i}),\theta_i)\ge u_i(g(\theta_i^\prime,\theta_{-i}),\theta_i),\\ \forall\theta_{-i},\theta_i^\prime,\theta_i,\\ \forall i\in N$$

  > **Revelation Principle**: An indirect mechanism is DSI $\implies$ it is DSIC.

**Bayesian Implementable**
: An indirect mechanism that implements a SCF through Bayesian Equilibrium with,
  - $\exist, s_i:\Theta_i\to M_i$ such that $s_i(\theta_i)$ maximises ex-interim utility for player $i$ at $\theta_i,\\ \forall\theta_i\\ \forall i\in N$, i.e.,
      $$
        \mathbb{E}[u_i(g(s_i(\theta_i),s_{-i}(\theta_{-i})),\theta_i)\\ |\\ \theta_i]\ge\mathbb{E}[u_i(g(m_i^\prime,s_{-i}(\theta_{-i})),\theta_i)\\ |\\ \theta_i],\\ \forall m_i^\prime,\theta_i,\\ \forall i\in N
      $$
  - $g(s_i(\theta_i),s_{-i}(\theta_{-i}))=f(\theta),\\ \forall\theta\in\Theta$

> An indirect mechanism is DSI $\implies$ it is Bayesian implementable.

**Bayeisan Incentive Compatible [BIC]**
: A direct mechanism such that,
  $$\mathbb{E}[u_i(f(\theta_i,\theta_{-i}),\theta_i)\\ |\\ \theta_i]\ge\mathbb{E}[u_i(f(\theta_i^\prime,\theta_{-i}),\theta_i)\\ |\\ \theta_i],\\ \forall \theta_{-i},\theta_i^\prime,\theta_i,\\ \forall i\in N$$

> An indirect mechanism is Bayesian Implementable $\implies$ it is BIC.

### Arrow's Impossibility Result

**Individual Preferences** ($R_i$)
: $\mathcal{R}$ is the set of ordering relations over a set of alternatives $A=\\\{a_1,a_2,\dots,a_m\\\}$. Every player has a preference $R_i\in\mathcal{R},\\ \forall i\in N$ such that,
  - Completeness: $\forall a,b\in A$, $aR_ib$ or $bR_ia$
  - Reflexivity: $\forall a\in A$, $aR_ia$
  - Transitivity: $\forall a,b,c\in A$, $aR_ib\And bR_ic\implies aR_ic$

**Linear Preferences** ($P_i$)
: $R_i$ such that $\forall a,b\in A$, $aR_ib\And bR_ia\implies a=b$
  - Set of all linear preferences is called $\mathcal{P}$.
  - Any arbitrary preference ordering $R_i$ can be decomposed into,
    - Asymmetric: $P_i$
    - Symmetric: $I_i$

**Arrovian Social Welfare Function [ASWF]** ($F:\mathcal{R}^n\to\mathcal{R}$)
: Capture the collective ordering of the society given the individual preferences.
  - $F(R)=F(R_1,R_2,\dots,R_N)$
  - $\hat F(R)$ is the asymmetric part of $F(R)$
  - $\bar F(R)$ is the symmetric part of $F(R)$

**Weak Pareto [WP]**
: F such that $\forall a,b\in A,\forall R\in \mathcal{R}^n$
  $$\forall i\in N, aP_ib\implies a\hat F(R)b$$

**Strong Pareto [SP]**
: F such that $\forall a,b\in A,\forall R\in \mathcal{R}^n$
  $$\forall i\in N, aR_ib\\ \And\\ \exist j\in N, aP_jb\implies a\hat F(R)b$$

**Agreement** ($R|_{a,b}$)
: - $R_i,R_i^\prime\in \mathcal{R}$ agree on $a,b\in A$ for agent $i$ iff,
    $$
      aP_ib\iff aP_i^\prime b\\ ||\\ bP_ia\iff bP_i^\prime a\\ ||\\ aI_ib\iff aI_i^\prime b
    $$
  - This means $R_i|_z=R_i^\prime|_z$ where $z=\\\{a,b\\\}$
  - When this holds for every $i\in N$, $R|_z=R^\prime|_z$ where $z=\\\{a,b\\\}$

**Independence of Irrelevant Alternatives [IIA]**
: $F$ such that $\forall a,b\in A,\\ \forall R,R^\prime\in\mathcal{R}^n$ and $z=\\\{a,b\\\}$,
  $$R|_z=R^\prime|_z\implies F(R)|_z=F(R^\prime)|_z$$

**Dictatorship** $F^d$
: An ASWF where for an agent $d$, $F^d(R) = R_d$

> **Arrow's Theorem**: For $|A|\ge3$ if $F$ is $IIA$ and $WP$ then $F$ must be dictatorial.

### Social Choice Functions

**Social Choice Function [SWF]** $f:\mathcal{P}^n\to A$
: Here $\mathcal{P}$ is the set of all linear preference orderings and $A$ is the set of alternatives

One SCF is voting where the scoring is done by any one of the following methods and the winner is the alternative with the highest score:
1. Plurality: $(1,0,\dots,0,0)$
2. Veto: $(1,1,\dots,1,0)$
3. Borda: $(m-1,m-2,\dots,1,0)$
4. Harmonic: $(1,1/2,\dots,1/(m-1),1/m)$
5. $k$-approval: $(1,\cdots (k\text{ times})\cdots,1,0,\dots,0)$
6. Plurality with runoff (eliminations)
7. Maxmin: $\text{score}(a)=\min_y|\\\{i:aP_iy\\\}|$
8. Copeland: Score is number of wins in pairwise elections

**Condorcet Winner**
: A candidate that defeats all other candidates in pairwise election

**Condorcet Consistent**
: A voting rule that always selects the *Condorcet winner* when one exists.

> None out of Plurality, Copeland, Maxmin are Condorcet consistent.

**Pareto Dominance**
: An alternative $a$ is Pareto dominant over $b$ when $\forall i\in N,\\ aP_ib$.

**Pareto Efficiency [PE]**
: An SCF $f$ such that $\forall P\in \mathcal{P}^n$ and $\forall a\in A$, a is Pareto dominated $\implies f(P)\not ={a}$

**Unanimity [UN]**
: An SCF $f$ such that $\forall P\in\mathcal{P}^n$ and $\exists a\in A$, $P_1(1)=P_2(1)=\dots=P_N(1)=a\implies f(P)=a$

**Onto [ONTO]**
: An SCF $f$ such that $\forall a\in A$, $\exists P^{(a)}\in\mathcal{P}^n$ where $f(P^{(a)})=a$

> PE $\implies$ UN $\implies$ ONTO

**Manipulability**
: An SCF $f$ such that $\exists i\in N$ and a profile $P\in\mathcal{P}^n$ such that $\exists P_i^\prime,\\ f(P_i^\prime,P_{-i})P_if(P_i,P_{-i})$

**Strategy-proof [SP]**
: An SCF that is not manipulable by any player for any profile

**Dominated Set** ($D:A\times\mathcal{P}\to \mathcal{P}(A)$)
: $D(a,P_i)=\\\{b\in A:aP_ib\\}$

**Monotone [MONO]**
: An SCF $f$ such that $\forall P,P^\prime\in\mathcal{P}^n$ and $\exists a\in A$, $f(P)=a$ and $D(a,P_i)\sube D(a,P_i^\prime)\\ \forall i\in N\implies f(P^\prime)=a$

> **Theorem** : SP $\iff$ MONO.
>
> **Lemma** : MONO+ONTO $\implies$ PE.
>
> **Corollary** : SP+PE $\iff$ SP+UN $\iff$ SP+ONTO
>
> **Gareth and Satterthwaite Theorem** : If $|A|\ge 3$ then SP+ONTO $\iff$ Dictatorial.

### Domain Restrictions

#### Single Peaked Preferences

**Single Peaked Preferences** ($\mathcal{S}$)
: Set of linear preferences $P$ w.r.t. a common order $<$ over the alternatives such that
  - $\forall b,c\in A,\\ b<c\le P(1)\implies cPb$
  - $\forall b,c\in A,\\ P(1)\le b<c\implies bPc$

> From now onwards $f:\mathcal{S}^n\to A$

**Median Voter SCF**
: An SCF $f$ such that $\exists B=\\\{y_1, y_2,\dots,y_{n-1}\\\},\forall P\in\mathcal{S}^n,\\ f(P)=\text{median}(B\cup\text{peaks}(P))$

> Points in $B$ are called phantom peaks and these are independent of $P$.
>
> **Moulin's Theorem** : Every median voter SCF is SP.
>
> **Claim** : Let $p_{\min}$ and $p_{\max}$ be the leftmost and rightmost peaks of $P$ according to $<$, then $f$ is PE $\iff\\ f(P)\in[p_{\min},p_{\max}]$.
>
> **Theorem** : SP $\implies$ MONO.
>
> **Theorem** : If $f$ is SP then ONTO $\iff$ UN $\iff$ PE.

**Anonimity [ANON]**
: An SCF $f$ such that $\forall P$ and for all permutations of agents $\sigma$, $f(P^\sigma)=f(P)$

> **Moulin's Theorem 2** : $f$ is SP+ONTO+ANON $\iff$ $f$ is median voter SCF.

#### Task Allocation Domain

**Task Allocation SCFs** ($f:T^n\to A$)
: - Here $A=\\\{(a_1,a_2,\dots,a_n)\in [0,1]^n\\ |\\ \sum_{i=1}^na_i=1\\\}$.
  - For $P\in T^n,\\ f(P)=(f_1(P),f_2(P),\dots,f_n(P))$.
  - Each player has a peak allocation $p_i=w/2c_i$ where the reward is given by $wt-c_i t^2$.

**Pareto Efficiency [PE]**
: An SCF such that $\forall P\in T^n, \not\exists a\in A$,
$$
   aR_if(P)\\ \\ \forall i\in N\\\
   aP_jf(P)\\ \\ \exists j\in N
$$

> Implications of Pareto Efficiency:
> - If $\sum_{i=1}^np_i=1$ then $\forall i\in N, f_i(P)=p_i$
> - If $\sum_{i=1}^np_i>1$ then $\forall i\in N, f_i(P)\ge p_i$
> - If $\sum_{i=1}^np_i<1$ then $\forall i\in N, f_i(P)\le p_i$

**Serial Dictatorship**
: Each agent gets their peak allocation except the last one which is given the leftover share.

> Serial Dictatorship is not ANON since it is unfair to the last agent.

**Proportional SCF**
: Every agent is assigned a share that is $1/\sum_{i=1}^np_i$ times their peak allocation.

> Proportional SCF is not SP.

**Uniform Rule**
: - $\sum_{i=1}^np_i=1:f_i(P)=p_i$
  - $\sum_{i=1}^np_i>1:f_i(P)=\max[p_i,\mu(P)]$ where $\mu$ solves $\sum_{i=1}^n\max[\mu,p_i]=1$
  - $\sum_{i=1}^np_i<1:f_i(P)=\min[p_i,\lambda(P)]$ where $\lambda$ solves $\sum_{i=1}^n\min[\lambda,p_i]=1$

> **Sprumont Theorem**: Uniform Rule is SP, ANON and PE.
>
> **Theorem**: SCF in task allocation domain is SP, PE and ANON $\iff$ it is an uniform rule.

#### Quasi-Linear Domain

**Quasi-linear Payoff**
: - Preferences are of the form $a\in A$
  - Payments are defined for every player as $\pi=(\pi_1,\pi_2,\dots,\pi_n)\in\R^n$
  - Utility of an agent $i$ depends on the outcome $(a,\pi)$ and their type $\theta_i\in\Theta_i$ as,
    $$
      u_i((a,\pi),\theta_i)=v_i(a,\theta_i)-\pi_i
    $$

**Quasi-Linear Preferences** $(f,p)$
: Has following components,
  1. Allocation rule:
    $$
      f:\Theta_1\times\Theta_2\times\cdots\times\Theta_n\to A
    $$
  2. Payment function: $p=(p_1,p_2,\dots,p_n)$ such that,
    $$
      p_i:\Theta_1\times\Theta_2\times\cdots\times\Theta_n\to\R
    $$

Examples of Allocation rules:
- Constant rule: $f^c(\theta)=a\in A,\forall\theta\in\Theta$
- Dictatorial rule: $f^D(\theta)=\arg\max_{a\in A}v_d(a,\theta_d),\forall\theta\in\Theta$ and $\exists d\in N$
- Allocative efficiency / Utilitarian rule:
  $$
    f^{AE}(\theta) = \arg\max_{a\in A}\sum_{i\in N}v_i(a,\theta_i)
  $$
- Affine Maximizer rule: When $\lambda_i\ge 0$ and not all zero,
  $$
    f^{AM}(\theta) = \arg\max_{a\in A}\left(\sum_{i\in N}\lambda_iv_i(a,\theta_i)+\kappa(a)\right)
  $$
- Max-min / Egalitarian rule:
  $$
    f^{MM}(\theta) = \arg\max_{a\in A}\min_{i\in N}v_i(a,\theta_i)
  $$


Examples of Payment functions:
- No deficit: $\sum_{i\in N}p_i(\theta)\ge 0,\forall\theta\in\Theta$
- No subsidy: $p_i(\theta)\ge 0,\forall\theta\in\Theta,\forall i\in N$
- Budget Balanced: $\sum_{i\in N}p_i(\theta) = 0,\forall\theta\in\Theta$

**Dominant Strategy Incentive Compatible [DSIC]**
: An $(f,p)$ such that $\forall\theta_{-i}\in\Theta_{-i},\forall\theta_i,\tilde\theta_i\in\Theta_i,\forall i\in N$,
  $$v_i(f(\theta_i,\theta_{-i}),\theta_i)-p_i(\theta_i,\theta_{-i})\ge v_i(f(\tilde\theta_i,\theta_{-i}),\theta_i)-p_i(\tilde\theta_i,\theta_{-i})$$

> If $(f,p)$ is DSIC then for any $q$ defined as,
> $$
>   q_i(\theta_i,\theta_{-i})=p_i(\theta_i,\theta_{-i})+h_i(\theta_{-i}),\\ \forall\theta,\forall i\in N
> $$
> $(f,q)$ is also DSIC.

**Pareto Optimal**
: A mechanism $(f,p)$ such that $\forall\theta\in\Theta$ there does not exist $b\in A$ and payments $(\pi_1,\pi_2,\dots,\pi_n)$ with $\sum_{i\in N}\pi_i\ge \sum_{i\in N}p_i(\theta)$,
  $$v_i(b,\theta_i)-\pi_i\ge v_i(f(\theta),\theta_i)-p_i(\theta)$$
with inequality being strict for some $i\in N$.

> **Theorem** : Pareto Optimal $\iff$ Allocatively efficient.

**Groves Payment fucntion**
: For agent $i\in N$ and an arbitrary $h_i:\Theta_{-i}\to\R$,
  $$p_i^G(\theta_i,\theta_{-i}) = h_i(\theta_{-i})-\sum_{j\not ={i}}v_j(f^{AE}(\theta_i,\theta_{-i}),\theta_j)$$

> Groves payment functions implement the Allocatively efficiency allocation function.
> 
> **Theorem**: Groves mechanisms are DSIC.

**Vickrey-Clarke-Groves Mechanism [VCG]**
: Groves mechanism with $h_i(\theta_{-i})$ as,
  $$h_i(\theta_{-i})=\max_{a\in A}\sum_{j\in N,\\ j\not={i}}v_j(a,\theta_j)\\\
    \\ \\\
    p_i^{VCG}(\theta_i,\theta_{-i})=\max_{a\in A}\sum_{j\in N,\\ j\not={i}}v_j(a,\theta_j)-\sum_{j\in N,\\ j\not={i}}v_j(f^{AE}(\theta_i,\theta_{-i}),\theta_j)\\\
    \\ \\\
    u_i^{VCG}(\theta_i,\theta_{-i}) = \sum_{j\in N}v_j(f^{AE}(\theta_i,\theta_{-i}),\theta_j)-\max_{a\in A}\sum_{j\in N,\\ j\not={i}}v_j(a,\theta_j)$$

### Combinatorial Allocation

**Combinatorial Allocation**
: - $M=\\\{1,2,\dots,m\\\}$ : set of objects
  - $\Omega=2^M$ : set of bundles
  - $\theta_i:\Omega\to\R$ : type/values of player $i$ such that $\theta_i(s)\ge 0,\\ \forall s\in\Omega$ and $\theta_i(a)=\theta_i(a_i)$
  - $N=\\\{1,2,\dots,n\\\}$ : set of agents
  - $A=\\\{(a_0,a_1,\dots,a_n)\\ |\\ a_i\in\Omega,a_i\cap a_j=\empty\\ \forall i\not={j},\bigcup_{i=0}^na_i=\Omega\\\}$ : set of allocations where $a_0$ is the set of unallocated items

> **Claim**: The payment of an agent that gets no goods in VCG mechanism is zero.

**Individually Rational**
: A mechanism $(f,p)$ such that $v_i(f(\theta),\theta_i)-p_i(\theta)\ge 0,\\ \forall\theta\in\Theta,\\ \forall i\in N$

> **Claim**: In allocation of goods VCG mechanism is Individually rational.

**Independence of Non-influential agents [INA]**
: An affine maximizer $f^{AM}$ such that for all $i\in N$ with $\lambda_i=0$,
  $$
    f^{AM}(\theta_i,\theta_{-i}) = f^{AM}(\theta_i^\prime,\theta_{-i})
  $$

> **Theorem** : ANI $\implies$ DSIC.
> Payements for such rule are,
> $$
>   p_i^{AM}(\theta_i,\theta_{-i})=\begin{Bmatrix}
>     \frac{1}{\lambda_i}\\\{h_i(\theta_{-i})-\sum_{j\ne=i}[\lambda_jv_j(f^{AM}(\theta))+\kappa(f^{AM}(\theta))]\\\} & \lambda_i>0\\\
>     0 & \lambda_i=0
>   \end{Bmatrix}
> $$

> **Robert's Theorem** : If type space is unrestricted then, $ONTO+DSIC\implies$ affine maximizer.

### Single Object Allocation

**Single object allocation**
: - $t_i\in T_i$ : value of agent $i$ if they win
  - $a\in \Delta A$ : Allocation probabilities of each agent
    $$
      \Delta A = \\\{a\in[0,1]^{n+1} : \sum_{i\in N}a_i=1\\\}
    $$
  - $f:T_1\times T_2\times\cdots\times T_n\to\Delta A$ : Allocation rule
    - $f_i(t)$ is the probability of agent $i$ winning.
    - $f_0(t)$ is the probability the object goes unallocated.
  - $v_i=a_i\cdot t_i$ : Expected valuation

**Non-decreasing Allocation rule**
: An allocation rule such that $\forall i\in N$ and $\forall t_{-i}\in T_{-i}$ we have $f_i(t_i,t_{-i}), \forall s_i,t_i\in T_i,t_i>s_i$.

> **Myerson Theorem** : Suppose $T_i=[0,b_i],\forall i\in N$ and the valuations are in the product form (as above). An allocation rule and payment function is DSIC iff,
> 1. $f$ is non-decreasing
> 2. payements are given by,
>   $$
>     p_i(t_i,t_{-i})=p_i(0,t_{-i})+t_if_i(t_i,t_{-i})-\int_0^{t_i}f_i(x,t_{-i})dx
>   $$
>
> **Corollary** : In single object allocation domain, DSIC $\iff$ non-decreasing.

**Ex-post Individual rational [IR]**
: A mechanism $(f,p)$ such that,
  $$
    t_if_i(t_i,t_{-i})-p_i(t_i,t_{-i})\ge 0
  $$

> **Lemma** : In single object allocation, a DSIC mechanism is,
> 1. IR $\iff\forall i\in N$ and $\forall t_{-i}\in T_{-i},p_i(0,t_{-i})\le 0$.
> 2. IR and follows no subsidy $\iff\forall i\in N$ and $\forall t_{-i}\in T_{-i},p_i(0,t_{-i})=0$

**Revenue Maximization Setup**
: - Common prior $G$ over all the $T$. $g$ denotes the desity.
  - Every allocation $(f,p)$ induces an expected allocation and payement rule,
    $$
      \alpha_i(s_i|t_i) = \int_{s_{-i}\in T_{-i}}f_i(s_i,s_{-i})g_{-i}(s_{-i}|t_i)ds_{-i}\\\
      \\ \\\
      \pi_i(s_i|t_i) = \int_{s_{-i}\in T_{-i}}p_i(s_i,s_{-i})g_{-i}(s_{-i}|t_i)ds_{-i}
    $$
  - Expected utilty of agent $i$: $u_i=t_i\alpha_i(s_i|t_i)-\pi_i(s_i|t_i)$

**Bayesian Incentive compatibility [BIC]**
: $\forall i\in N, \forall s_i,t_i\in T_i$,
  $$
    t_i\alpha_i(t_i|t_i)-\pi_i(t_i|t_i) \ge t_i\alpha_i(s_i|t_i)-\pi_i(s_i|t_i)
  $$

If we assume priors are independent i.e.,
$$
  G(s_1,s_2,\dots,s_n)=\Pi_{i\in N}G_i(s_i)\\\
  \\ \\\
  \implies \alpha_i(s_i|t_i) = \alpha_i(s_i)
$$

**Non decreasing expectations [NDE]**
: $s_i<t_i\implies \alpha_i(s_i)\le \alpha_i(t_i)$

> **Myerson Theorem 2** : A mechanism $(f,p)$ in independent prior setting is BIC iff,
> 1. $f$ is NDE
> 2. $p_i$ satisfies $\pi_i(t_i) = \pi_i(0)+t_i\alpha_i(t_i)-\int_0^{t_i}\alpha_i(x)dx$

**Interim Individual rationality [IIR]**
: $\forall i\in N, t_i\alpha_i(t_i)-\pi_i(t_i)\ge 0$

> **Lemma** : A mechanism $(f,p)$ in independent prior setting is BIC and IIR iff,
> 1. $f$ is NDE
> 2. $p_i$ satisfies $\pi_i(t_i) = \pi_i(0)+t_i\alpha_i(t_i)-\int_0^{t_i}\alpha_i(x)dx$
> 3. $\forall i\in N, \pi_i(0)\le 0$

#### Single Agent Optimal Mechanism

**Optimal Mechanism**
: A mechanism $M^\ast$ in the class of all single agent mechanisms that are IC (BIC and DSIC equivalent) and IR (IR and IIR equivalent) such that, $\Pi^{M^\ast}\ge\Pi^M,\\ \forall M$ where,
$$
  \Pi^M = \int^\beta_0p(t)g(t)dt
$$

> **Lemma** : For any implementable allocation rule $f$ we have,
> $$
>   \Pi^f=\int_0^\beta\left(t-\frac{1-G(t)}{g(t)}\right)g(t)f(t)dt\\\
>   =\int_0^\beta w(t)f(t)dt
> $$
> Here $w(t)$ is called the virtual valuation of the agent.

**Monotone Hazard Rate condition [MHR]**
: A $G$ for which $\frac{g(x)}{1-G(x)}$ is non-decreasing

> **Fact** : If $G$ satisfies MHR then $x=\frac{1-G(x)}{g(x)}$ has a solution.
>
> **Theorem** : A mechanism $(f,p)$ is optimal under MHR iff,
> - $x^\ast$ is the solution from above fact and $\alpha\in[0,1]$ then,
>   $$
>     f(t) = \begin{Bmatrix}
>       0 & t < x^\ast\\\
>       \alpha & t = x^\ast\\\
>       1 & t > x^\ast\\\
>     \end{Bmatrix}
>   $$
> - For all $t\in T$,
>   $$
>     p(t) = \begin{Bmatrix}
>       x^\ast & t\ge x^\ast\\\
>       0 & \text{otherwise}\\\
>     \end{Bmatrix}
>   $$

#### Many Agents Optimal Mechanism

**Optimal Mechanism**
: A mechanism with NDE $f$ maximizing,
  $$
    \max\int_T\left(\sum_{i\in N}w_i(t_i)f_i(t)\right)g(t)dt\\\
    \\ \\\
    w_i(t_i) = t_i-\frac{1-G_i(t_i)}{g_i(t_i)}
  $$

**Regular**
: A virtual valuation $w_i$ such that $\forall s_i,t_i\in T_i$ with $s_i<t_i$ it holds that $w_i(s_i)\le w_i(t_i)$

> **Theorem** : When every agent's valuation is regular then for every type profile $t$ is $w_i(t_i)<0\forall i\in N,f_i(t)=0,\forall i\in N.$
>
> Otherwise,
> $$
>   f_i(t)=\begin{Bmatrix}
>     1 & w_i(t_i)\le w_j(t_j)\forall j\in N\\\
>     0 & \text{otherwise}\\\
>   \end{Bmatrix}\\\
>   \\ \\\
>   p_i(t) = \begin{Bmatrix}
>     0 & f_i(t)=0\\\
>     \max\\\{w_i^{-1}(0),K_i^\ast(t_{-i})\\\} & f_i(t)=1\\\
>   \end{Bmatrix}\\\
> $$
> where $K_i^\ast(t_{-i}) = \inf\\\{t_i:f_i(t_i,t_{-i})=1\\\}$ then (f,p) is optimal.

### Efficiency and Budget Balance

> **Green-Laffont-Holmstrom Theorem** : If the type space is 'sufficiently rich', every efficient and DSIC mechanism is a Groves mechanism.
> 
> **Green and Laffont Theorem** : No Groves mechanism is budget balanced, i.e. $\not\exist p_i^G$ s.t., $\sum_{i\in N}p_i^G(t)=0,\forall t\in T$.
> 
> **Corollary** : If the valuation space is sufficiently rich no efficient mechanism can be both DSIC and BB.

**dAGVA payments** ($p^\text{dAGVA}$)
: Given by,
  $$
    p_i^\text{dAGVA}(t) = \frac{1}{n-1}\sum_{j\not=i}\delta_j(t_j)-\delta_i(t_i)
  $$

> **Theorem** : The dAGVA mechanism is efficient, BIC and BB.
>
> **Myerson-Satterthwaite Theorem** : In bilateral trade (seller and buyer) no mechanism can be simultaneously BIC, effcient, IIR and budget balanced.