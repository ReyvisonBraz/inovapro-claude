import { useMemo } from 'react';
import { parseISO, startOfDay } from 'date-fns';
import { ClientPayment, ServiceOrder } from '../types';

export const useNotifications = (
  clientPayments: ClientPayment[],
  serviceOrders: ServiceOrder[]
) => {
  const today = startOfDay(new Date());

  const upcomingDebts = useMemo(() => {
    return clientPayments.filter(p => {
      if (p.status === 'paid') return false;
      const dueDate = parseISO(p.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 3;
    });
  }, [clientPayments, today]);

  const dueTodayDebts = useMemo(() => {
    return clientPayments.filter(p => {
      if (p.status === 'paid') return false;
      const dueDate = parseISO(p.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  }, [clientPayments, today]);

  const overdueDebts = useMemo(() => {
    return clientPayments.filter(p => {
      if (p.status === 'paid') return false;
      const dueDate = parseISO(p.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() < today.getTime();
    });
  }, [clientPayments, today]);

  const overdueServiceOrders = useMemo(() => {
    return serviceOrders.filter(o => {
      if (o.status === 'Concluído' || o.status === 'Entregue' || o.status === 'Cancelado') return false;
      if (!o.analysisPrediction) return false;
      const predictionDate = parseISO(o.analysisPrediction);
      predictionDate.setHours(0, 0, 0, 0);
      return predictionDate.getTime() < today.getTime();
    });
  }, [serviceOrders, today]);

  const dueTodayServiceOrders = useMemo(() => {
    return serviceOrders.filter(o => {
      if (o.status === 'Concluído' || o.status === 'Entregue' || o.status === 'Cancelado') return false;
      if (!o.analysisPrediction) return false;
      const predictionDate = parseISO(o.analysisPrediction);
      predictionDate.setHours(0, 0, 0, 0);
      return predictionDate.getTime() === today.getTime();
    });
  }, [serviceOrders, today]);

  const upcomingServiceOrders = useMemo(() => {
    return serviceOrders.filter(o => {
      if (o.status === 'Concluído' || o.status === 'Entregue' || o.status === 'Cancelado') return false;
      if (!o.analysisPrediction) return false;
      const predictionDate = parseISO(o.analysisPrediction);
      predictionDate.setHours(0, 0, 0, 0);
      const diffTime = predictionDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 3;
    });
  }, [serviceOrders, today]);

  const totalPaymentNotifications = upcomingDebts.length + dueTodayDebts.length + overdueDebts.length;
  const totalServiceOrderNotifications = overdueServiceOrders.length + dueTodayServiceOrders.length + upcomingServiceOrders.length;
  const totalNotifications = totalPaymentNotifications + totalServiceOrderNotifications;

  return {
    upcomingDebts,
    dueTodayDebts,
    overdueDebts,
    overdueServiceOrders,
    dueTodayServiceOrders,
    upcomingServiceOrders,
    totalPaymentNotifications,
    totalServiceOrderNotifications,
    totalNotifications
  };
};
