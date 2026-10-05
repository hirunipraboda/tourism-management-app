enum ReceiptType { chatbot, tourPackage }

class PaymentReceipt {
  final String orderId;
  final ReceiptType type;
  final String title;
  final String description;
  final double amount;
  final DateTime paidAt;
  final String paymentMethod;
  final String status;
  final String customerName;
  final String customerEmail;
  final String? period;
  final int? participants;

  const PaymentReceipt({
    required this.orderId,
    required this.type,
    required this.title,
    required this.description,
    required this.amount,
    required this.paidAt,
    required this.paymentMethod,
    this.status = 'Paid',
    this.customerName = 'Sarah Lin',
    this.customerEmail = 'sarah.lin@example.com',
    this.period,
    this.participants,
  });
}

/// In-app receipt ledger. Newly completed purchases are recorded here and
/// appear in Profile > Payment Receipts alongside the seeded history.
class PaymentReceiptStore {
  static final List<PaymentReceipt> _receipts = [
    PaymentReceipt(
      orderId: 'AI-482910',
      type: ReceiptType.chatbot,
      title: 'AI EXPLORER Plan',
      description: 'AI Travel Guide chatbot · weekly subscription with photo queries',
      amount: 9.99,
      paidAt: DateTime(2026, 10, 2, 9, 41),
      paymentMethod: 'Visa (Stripe) •••• 4242',
      period: 'week',
    ),
    PaymentReceipt(
      orderId: 'AI-337105',
      type: ReceiptType.chatbot,
      title: 'AI GUIDE Plan',
      description: 'AI Travel Guide chatbot · weekly subscription',
      amount: 4.99,
      paidAt: DateTime(2026, 9, 18, 18, 5),
      paymentMethod: 'Visa (Stripe) •••• 4242',
      period: 'week',
    ),
    PaymentReceipt(
      orderId: 'TL-BK-84920',
      type: ReceiptType.tourPackage,
      title: 'Cultural Triangle & Hill Country Odyssey',
      description: 'Tour package · Oct 15 – Oct 20, 2026',
      amount: 680.00,
      paidAt: DateTime(2026, 9, 25, 14, 12),
      paymentMethod: 'Mastercard (Stripe) •••• 8812',
      participants: 2,
    ),
    PaymentReceipt(
      orderId: 'TL-BK-63211',
      type: ReceiptType.tourPackage,
      title: 'Southern Coastline & Marine Whale Safari',
      description: 'Tour package · Nov 02 – Nov 06, 2026',
      amount: 890.00,
      paidAt: DateTime(2026, 9, 29, 11, 30),
      paymentMethod: 'Mastercard (Stripe) •••• 8812',
      participants: 3,
    ),
  ];

  static List<PaymentReceipt> all() {
    final list = List<PaymentReceipt>.from(_receipts);
    list.sort((a, b) => b.paidAt.compareTo(a.paidAt));
    return list;
  }

  static void add(PaymentReceipt receipt) => _receipts.add(receipt);
}
