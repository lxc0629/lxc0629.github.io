
-- Playground driver: evaluate the actual Lean function at every pixel.
#eval do
  let rows := (List.range 100).map fun row =>
    String.ofList ((List.range 100).map fun col =>
      if f (Int.ofNat (col + 1)) (Int.ofNat (row + 1)) then '1' else '0')
  IO.println ("PICO_PIXELS_BEGIN\n" ++ String.intercalate "\n" rows ++ "\nPICO_PIXELS_END")
