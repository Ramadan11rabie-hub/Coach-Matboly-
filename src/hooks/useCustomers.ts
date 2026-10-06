import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CustomerRegistration } from '../types/customer';

const COLLECTION_NAME = 'customers';

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAtTimestamp', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded: CustomerRegistration[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as CustomerRegistration;
            loaded.push({
              ...data,
              id: docSnap.id,
            });
          });
          setCustomers(loaded);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching customers from Firestore:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Firestore init error:', err);
      setError(err.message || 'Failed to initialize Firestore');
      setLoading(false);
    }
  }, []);

  const addCustomer = async (data: Omit<CustomerRegistration, 'id' | 'createdAt' | 'createdAtTimestamp' | 'status'>) => {
    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    
    // Clean all undefined values to prevent Firestore 'unsupported field value: undefined' errors
    const cleanedData: Record<string, any> = {};
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) {
        cleanedData[key] = val;
      }
    });

    const customerObj = {
      ...cleanedData,
      id,
      status: 'new' as const,
      createdAt: now.toISOString(),
      createdAtTimestamp: now.getTime(),
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), {
        ...customerObj,
        _serverTimestamp: serverTimestamp(),
      });
      return { success: true, id };
    } catch (err: any) {
      console.error('Failed to save customer to Firestore:', err);
      return { success: false, error: err.message };
    }
  };

  const updateCustomerStatus = async (customerId: string, status: CustomerRegistration['status']) => {
    try {
      const customerRef = doc(db, COLLECTION_NAME, customerId);
      await updateDoc(customerRef, { status });
      return { success: true };
    } catch (err: any) {
      console.error('Failed to update customer status:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, customerId));
      return { success: true };
    } catch (err: any) {
      console.error('Failed to delete customer:', err);
      return { success: false, error: err.message };
    }
  };

  const newCustomersCount = customers.filter((c) => c.status === 'new').length;

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomerStatus,
    deleteCustomer,
    newCustomersCount,
  };
}
