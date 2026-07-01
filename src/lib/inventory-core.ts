export type InvoicePaymentStatus = "Paid" | "Partially Paid" | "Unpaid";
export type ContainerMilestoneStage =
  | "At origin port"
  | "On the ship"
  | "At destination port"
  | "Released from port"
  | "Arrived at warehouse"
  | "Received into inventory";

export type ContainerInventoryStatus = "On Order" | "Partially Received" | "Received";

export type ContainerUnloadPlanStatus = "Not Scheduled" | "Scheduled" | "Ready to Unload" | "Unloaded";

export type ContainerUnloadPlan = {
  containerId: string;
  scheduledUnloadDate: string | null;
  scheduledUnloadTime: string | null;
  warehouseBay: string | null;
  forkliftNeeded: boolean;
  staffAssigned: string[];
  estimatedPallets: number;
  estimatedUnits: number;
  notes: string;
  status: ContainerUnloadPlanStatus;
};

export type ContainerDocumentStatus = "Uploaded" | "Missing";

export type ContainerDocument = {
  label: string;
  uploadedAt: string | null;
  status: ContainerDocumentStatus;
};

export type ContainerReceivingStatus = "Pending" | "Received" | "Short" | "Overage" | "Damaged";

export type ContainerReceivingLine = {
  erpProductId: string;
  expectedQty: number;
  actualQty: number;
  damagedQty: number;
  status: ContainerReceivingStatus;
  notes: string;
};

export type ErpProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  dimensions: string;
  listPrice: number;
  salePrice: number;
  onFloorQty: number;
  inStockQty?: number;
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
  poNumber: string;
  containerNo: string;
  supplier: string;
  trackingNumber: string;
  trackingSource: string;
  origin: string;
  originPortDate: string;
  onShipDate: string;
  poDate: string;
  portDate: string;
  deliveryDate: string;
  portName: string;
  paymentStatus: InvoicePaymentStatus;
  status: ContainerMilestoneStage;
  inventoryStatus: ContainerInventoryStatus;
  uploadedAt: string;
  trackingConnected: boolean;
  milestones: { stage: ContainerMilestoneStage; date: string }[];
  items: ContainerItem[];
};

export type ProductAssignment = {
  productId: string;
  customerName: string;
  invoiceNo: string;
  qty: number;
};

export type ProductAvailabilitySnapshot = {
  floorQty: number;
  inStockQty: number;
  onFloorQty: number;
  soldAssignedQty: number;
  incomingQty: number;
  oversoldQty: number;
  onOrderQty: number;
  forSaleQty: number;
  availableNowQty: number;
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
  const floorQty = product.onFloorQty;
  const inStockQty = product.inStockQty ?? 0;
  const receivedQty = getReceivedUnitsForProduct(containers, product.id);
  const onFloorQty = floorQty + inStockQty + receivedQty;

  const soldAssignedQty = assignments
    .filter((assignment) => assignment.productId === product.id)
    .reduce((sum, assignment) => sum + assignment.qty, 0);

  const incomingContainers = containers
    .filter((container) => !isContainerReceived(container))
    .map((container) => ({
      container,
      qty: container.items
        .filter((item) => item.erpProductId === product.id)
        .reduce((sum, item) => sum + item.qty, 0),
    }))
    .filter((entry) => entry.qty > 0)
    .sort((a, b) => a.container.portDate.localeCompare(b.container.portDate));

  const incomingQty = incomingContainers.reduce((sum, entry) => sum + entry.qty, 0);
  const onOrderQty = incomingQty;
  const oversoldQty = Math.max(0, soldAssignedQty - onFloorQty);
  const availableNowQty = onFloorQty;
  const forSaleQty = availableNowQty + onOrderQty;
  const realAvailableQty = onFloorQty - soldAssignedQty + incomingQty;

  const next = incomingContainers[0];
  const nextContainerQty = next?.qty ?? 0;
  const availableAfterNextContainer = Math.max(0, nextContainerQty - oversoldQty);

  return {
    floorQty,
    inStockQty,
    onFloorQty,
    soldAssignedQty,
    incomingQty,
    oversoldQty,
    onOrderQty,
    forSaleQty,
    availableNowQty,
    realAvailableQty,
    nextContainerNo: next?.container.containerNo ?? null,
    nextContainerDate: next?.container.portDate ?? null,
    nextContainerPort: next?.container.portName ?? null,
    nextContainerQty,
    availableAfterNextContainer,
  };
}

export function isContainerReceived(container: ContainerShipment) {
  return container.status === "Received into inventory" || container.inventoryStatus === "Received";
}

export function getContainerLineCount(container: ContainerShipment) {
  return container.items.length;
}

export function getContainerTotalUnits(container: ContainerShipment) {
  return container.items.reduce((sum, item) => sum + item.qty, 0);
}

export function getReceivedUnitsForProduct(containers: ContainerShipment[], productId: string) {
  return containers
    .filter(isContainerReceived)
    .flatMap((container) => container.items)
    .filter((item) => item.erpProductId === productId)
    .reduce((sum, item) => sum + item.qty, 0);
}
