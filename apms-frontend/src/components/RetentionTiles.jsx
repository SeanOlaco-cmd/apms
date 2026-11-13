import { ArrowLeft, ArrowLeftRight, ArrowRight, UserMinus, Users } from "lucide-react";
import { Tile, TileGrid } from "./ui";
import { num, pct } from "../lib/format";

// { dropped, transferee_in, … } plus the two combined totals.
export const countTypes = (records = []) => {
  const c = { dropped: 0, transferee_in: 0, transferee_out: 0, shiftee_in: 0, shiftee_out: 0 };
  records.forEach((r) => { if (r.type in c) c[r.type] += 1; });
  return { ...c, transferees: c.transferee_in + c.transferee_out, shiftees: c.shiftee_in + c.shiftee_out };
};

// The seven summary tiles shown on the DH and Dean Retention pages.
export default function RetentionTiles({ counts, enrolled = 0 }) {
  const note = (n) => `${pct(n, enrolled)} of total enrollees`;
  return (
    <TileGrid min="9.5rem">
      <Tile icon={UserMinus} tone="red" label="Total Dropped" value={num(counts.dropped)} note={note(counts.dropped)} />
      <Tile icon={ArrowLeftRight} tone="purple" label="Total Transferees" value={num(counts.transferees)} note={note(counts.transferees)} />
      <Tile icon={ArrowLeft} tone="green" label="Transferee In" value={num(counts.transferee_in)} note={note(counts.transferee_in)} />
      <Tile icon={ArrowRight} tone="lavender" label="Transferee Out" value={num(counts.transferee_out)} note={note(counts.transferee_out)} />
      <Tile icon={ArrowLeftRight} tone="orange" label="Shiftee In" value={num(counts.shiftee_in)} note={note(counts.shiftee_in)} />
      <Tile icon={ArrowRight} tone="lavender" label="Shiftee Out" value={num(counts.shiftee_out)} note={note(counts.shiftee_out)} />
      <Tile icon={Users} tone="teal" label="Total Shiftee" value={num(counts.shiftees)} note={note(counts.shiftees)} />
    </TileGrid>
  );
}