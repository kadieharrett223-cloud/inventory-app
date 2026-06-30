import type { ContainerShipment, CustomerInvoice, ErpProduct, ProductMapping, QboProduct } from "@/lib/inventory-core";

export const erpProducts: ErpProduct[] = [
  { id: "p1", sku: "OE-ALPHA-001", name: "Olympic Bench Pro", onFloorQty: 5 },
  { id: "p2", sku: "OE-RACK-110", name: "Titan Power Rack", onFloorQty: 12 },
  { id: "p3", sku: "OE-PLATE-045", name: "Steel Plate Set 45lb", onFloorQty: 30 },
  { id: "p4", sku: "OE-BAR-700", name: "Competition Barbell", onFloorQty: 8 },
];

export const qboProducts: QboProduct[] = [
  { id: "q1", name: "Bench-Professional" },
  { id: "q2", name: "Power Rack (Heavy Duty)" },
  { id: "q3", name: "Steel Plates 45" },
  { id: "q4", name: "Comp Bar - Black Zinc" },
  { id: "q5", name: "Bench Pro Bundle" },
];

export const productMappings: ProductMapping[] = [
  { qboProductId: "q1", erpProductId: "p1", mappedAt: "2026-06-10" },
  { qboProductId: "q2", erpProductId: "p2", mappedAt: "2026-06-10" },
  { qboProductId: "q3", erpProductId: "p3", mappedAt: "2026-06-11" },
  { qboProductId: "q4", erpProductId: "p4", mappedAt: "2026-06-11" },
];

export const customerInvoices: CustomerInvoice[] = [
  {
    id: "inv1",
    invoiceNo: "INV-22118",
    customerName: "Northline Athletics",
    paymentStatus: "Paid",
    createdAt: "2026-06-28",
    approvedByShipping: true,
    lines: [
      { erpProductId: "p1", qty: 6 },
      { erpProductId: "p4", qty: 2 },
    ],
  },
  {
    id: "inv2",
    invoiceNo: "INV-22119",
    customerName: "Peak Fitness Supply",
    paymentStatus: "Partially Paid",
    createdAt: "2026-06-29",
    approvedByShipping: false,
    lines: [{ erpProductId: "p1", qty: 4 }],
  },
  {
    id: "inv3",
    invoiceNo: "INV-22120",
    customerName: "Grit Gym Group",
    paymentStatus: "Partially Paid",
    createdAt: "2026-06-29",
    approvedByShipping: false,
    lines: [{ erpProductId: "p2", qty: 3 }],
  },
  {
    id: "inv4",
    invoiceNo: "INV-22121",
    customerName: "Iron Harbor",
    paymentStatus: "Unpaid",
    createdAt: "2026-06-30",
    approvedByShipping: false,
    lines: [{ erpProductId: "p3", qty: 5 }],
  },
];

export const containerShipments: ContainerShipment[] = [
  {
    id: "c1",
    containerNo: "OOLU7649201",
    portDate: "2026-08-20",
    portName: "Long Beach",
    status: "In Transit",
    items: [
      { erpProductId: "p1", qty: 30 },
      { erpProductId: "p2", qty: 18 },
    ],
  },
  {
    id: "c2",
    containerNo: "MSCU1102933",
    portDate: "2026-09-04",
    portName: "Savannah",
    status: "Booked",
    items: [
      { erpProductId: "p3", qty: 80 },
      { erpProductId: "p4", qty: 24 },
    ],
  },
];
