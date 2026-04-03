const supabase = require('../config/supabase');

const profileController = {
  // PHẦN 1: QUẢN LÝ THÔNG TIN CÁ NHÂN (CUSTOMER)
  getProfile: async (req, res) => {
    const { customerId } = req.query; 

    try {
      const { data, error } = await supabase.from('Customer').select('customerID, fullName, email, phoneNumber, joinDay').eq('customerID', customerId).single();
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    const { customerId, fullName, phoneNumber } = req.body;

    try {
      const { data, error } = await supabase.from('Customer').update({ fullName, phoneNumber }).eq('customerID', customerId).select('customerID, fullName, email, phoneNumber').single();
      if (error) throw error;
      res.status(200).json({ message: "Cập nhật hồ sơ thành công!", user: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PHẦN 2: QUẢN LÝ SỔ ĐỊA CHỈ (ADDRESS)
  getAddresses: async (req, res) => {
    const { customerId } = req.query;

    try {
      const { data, error } = await supabase.from('Address').select('*').eq('idCustomer', customerId).order('addressID', { ascending: false });
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addAddress: async (req, res) => {
    const { customerId, receiverName, addressString } = req.body;

    try {
      const { data, error } = await supabase.from('Address').insert([{ idCustomer: customerId, receiverName, addressString }]).select().single();
      if (error) throw error;
      res.status(201).json({ message: "Thêm địa chỉ thành công!", address: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateAddress: async (req, res) => {
    const { addressId } = req.params;
    const { receiverName, addressString } = req.body;

    try {
      const { data, error } = await supabase.from('Address')
        .update({ receiverName, addressString })
        .eq('addressID', addressId)
        .select().single();
      if (error) throw error;
      res.status(200).json({ message: "Đã cập nhật địa chỉ", address: data });
    } catch (error) {
       res.status(500).json({ error: error.message });
    }
  },

  deleteAddress: async (req, res) => {
    const { addressId } = req.params; 

    try {
      const { error } = await supabase.from('Address').delete().eq('addressID', addressId);
      if (error) throw error;
      res.status(200).json({ message: "Đã xóa địa chỉ." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PHẦN 3: QUẢN LÝ PHƯƠNG THỨC THANH TOÁN (PAYMENT)
  getPaymentMethods: async (req, res) => {
    const { customerId } = req.query;

    try {
      const { data, error } = await supabase.from('Payment').select('*').eq('idCustomer', customerId);
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addPaymentMethod: async (req, res) => {
    const { customerId, paymentMethod } = req.body;

    try {
      const { data, error } = await supabase.from('Payment').insert([{ idCustomer: customerId, paymentMethod, status: 'Hoạt động' }]).select().single();
      if (error) throw error;
      res.status(201).json({ message: "Thêm phương thức thanh toán thành công!", payment: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updatePaymentMethod: async (req, res) => {
    const { paymentId } = req.params;
    const { paymentMethod, status } = req.body; 

    try {
      const { data, error } = await supabase.from('Payment')
        .update({ paymentMethod, status })
        .eq('paymentID', paymentId)
        .select().single();
      if (error) throw error;
      res.status(200).json({ message: "Cập nhật phương thức thanh toán thành công", payment: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deletePaymentMethod: async (req, res) => {
    const { paymentId } = req.params;
    try {
      const { error } = await supabase.from('Payment').delete().eq('paymentID', paymentId);
      if (error) throw error;
      res.status(200).json({ message: "Đã xóa phương thức thanh toán." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = profileController;