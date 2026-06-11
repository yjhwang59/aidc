-- Prevent duplicate availability slots for the same service and start time.
CREATE UNIQUE INDEX "AvailabilitySlot_serviceId_startAt_key" ON "AvailabilitySlot"("serviceId", "startAt");
