-- 谢尔宾斯基三角形：横纵坐标的二进制中不能有重叠的 1。
-- x 向右，y 向下；true 是黑色，false 是白色。
def f (x y : Int) : Bool :=
  decide (1 ≤ x ∧ x ≤ 100 ∧ 1 ≤ y ∧ y ≤ 100 ∧
    ((x - 1).toNat &&& (y - 1).toNat) = 0)

-- 对所有整数（包括画布外）成立，不只是检查 10,000 个点。
theorem transpose (x y : Int) : f x y = f y x := by
  simp only [f, Nat.and_comm (x - 1).toNat (y - 1).toNat, and_left_comm]

-- 画布外始终是白色。
theorem outside (x y : Int)
    (h : x < 1 ∨ 100 < x ∨ y < 1 ∨ 100 < y) :
    f x y = false := by
  have bounds : ¬ (1 ≤ x ∧ x ≤ 100 ∧ 1 ≤ y ∧ y ≤ 100) := by
    omega
  simp only [f, decide_eq_false_iff_not]
  intro ⟨hx, hx', hy, hy', _⟩
  exact bounds ⟨hx, hx', hy, hy'⟩

