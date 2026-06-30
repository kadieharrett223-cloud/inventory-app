export type InvoicePaymentStatus = "Paid" | "Partially Paid" | "Unpaid";
export type ContainerStatus = "Booked" | "In Transit" | "Arrived";

export type ErpProduct = {
  id: string;
  sku: string;
  name: string;
  onFloorQty: number;
};

export type QboProduct = {
  id: string;
  name: string;
};

export type ProductMapping = {
  qboProductId: string;
  erpProductId: string;
  mappedAt: string;
};

export type CustomerInvoiceLine = {
  erpProductId: string;
  qty: number;
};

export type CustomerInvoice = {
  id: string;
  invoiceNo: string;
  customerName: string;
  paymentStatus: InvoicePaymentStatus;
  createdAt: string;
  approvedByShipping: boolean;
  lines: CustomerInvoiceLine[];
};

export type ContainerItem = {
  erpProductId: string;
  qty: number;
};

export type ContainerShipment = {
  id: string;
  containerNo: string;
  portDate: string;
  portName: string;
  status: ContainerStatus;
  items: ContainerItem[];
};

export type ProductAssignment = {
  productId: string;
  customerName: string;
  invoiceNo: string;
  qty: number;
};

export type ProductAvailabilitySnapshot = {
  onFloorQty: number;
  soldAssignedQty: number;
  incomingQty: number;
  oversoldQty: number;
  realAvailableQty: number;
  nextContainerNo: string | null;
  nextContainerDate: string | null;
  nextContainerPort: string | null;
  nextContainerQty: number;
  availableAfterNextContainer: number;
};

export function isInvoiceEligibleForWarehouse(invoice: CustomerInvoice) {
  return invoice.paymentStatus === "Paid" || invoice.paymentStatus === "Partially Paid";
}

export function deriveAssignmentsFromApprovedInvoices(invoices: CustomerInvoice[]): ProductAssignment[] {
  return invoices
    .filter((invoice) => invoice.approvedByShipping && isInvoiceEligibleForWarehouse(invoice))
    .flatMap((invoice) =>
      invoice.lines.map((line) => ({
        productId: line.erpProductId,
        customerName: invoice.customerName,
        invoiceNo: invoice.invoiceNo,
        qty: line.qty,
      })),
    );
}

export function estimateArrivalWindowFromDeparture(departureDate: string, minDays = 60, maxDays = 90) {
  const base = new Date(departureDate);
  const min = new Date(base);
  min.setDate(min.getDate() + minDays);

  const max = new Date(base);
  max.setDate(max.getDate() + maxDays);

  return {
    earliest: min.toISOString().slice(0, 10),
    latest: max.toISOString().slice(0, 10),
  };
}

export function computeProductAvailability(
  product: ErpProduct,
  assignments: ProductAssignment[],
  containers: ContainerShipment[],
): ProductAvailabilitySnapshot {
  const soldAssignedQty = assignments
    .filter((assignment) => assignment.productId === product.id)
    .reduce((sum, assignment) => sum + assignment.qty, 0);

  const incomingContainers = containers
    .filter((container) => container.status !== "Arrived")
    .map((container) => ({
      container,
      qty: container.items
        .filter((item) => item.erpProductId === product.id)
        .reduce((sum, item) => sum + item.qty, 0),
    }))
    .filter((entry) => entry.qty > 0)
    .sort((a, b) => a.container.portDate.localeCompare(b.container.portDate));

  const incomingQty = incomingContainers.reduce((sum, entry) => sum + entry.qty, 0);
  const oversoldQty = Math.max(0, soldAssignedQty - product.onFloorQty);
  const realAvailableQty = product.onFloorQty - soldAssignedQty + incomingQty;

  const next = incomingContainers[0];
  const nextContainerQty = next?.qty ?? 0;
  const availableAfterNextContainer = Math.max(0, nextContainerQty - oversoldQty);

  return {
    onFloorQty: product.onFloorQty,
    soldAssignedQty,
    incomingQty,
    oversoldQty,
    realAvailableQty,
    nextContainerNo: next?.container.containerNo ?? null,
    nextContainerDate: next?.container.portDate ?? null,
    nextContainerPort: next?.container.portName ?? null,
    nextContainerQty,
    availableAfterNextContainer,
  };
}
