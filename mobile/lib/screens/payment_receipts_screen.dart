import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/payment_receipt_models.dart';
import '../theme/app_theme.dart';

class PaymentReceiptsScreen extends StatefulWidget {
  const PaymentReceiptsScreen({super.key});

  @override
  State<PaymentReceiptsScreen> createState() => _PaymentReceiptsScreenState();
}

class _PaymentReceiptsScreenState extends State<PaymentReceiptsScreen> {
  String _filter = 'All'; // All | Chatbot | Tour Packages

  List<PaymentReceipt> get _visible {
    final all = PaymentReceiptStore.all();
    if (_filter == 'Chatbot') return all.where((r) => r.type == ReceiptType.chatbot).toList();
    if (_filter == 'Tour Packages') return all.where((r) => r.type == ReceiptType.tourPackage).toList();
    return all;
  }

  @override
  Widget build(BuildContext context) {
    final receipts = _visible;
    final total = receipts.fold<double>(0, (s, r) => s + r.amount);
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      appBar: AppBar(
        title: Text(
          'Payment Receipts',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: NovaBrand.primary),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: ['All', 'Chatbot', 'Tour Packages'].map((f) {
              final selected = _filter == f;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(f,
                      style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: selected ? Colors.white : NovaBrand.slateDark)),
                  selected: selected,
                  selectedColor: NovaBrand.primary,
                  backgroundColor: Colors.white,
                  showCheckmark: false,
                  onSelected: (_) => setState(() => _filter = f),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: NovaBrand.primary,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total Paid', style: GoogleFonts.inter(fontSize: 11, color: Colors.white70)),
                    Text('\$${total.toStringAsFixed(2)}',
                        style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                  ],
                ),
                Text('${receipts.length} receipt${receipts.length == 1 ? '' : 's'}',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (receipts.isEmpty)
            Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text('No receipts yet.', style: GoogleFonts.inter(color: NovaBrand.slateMuted)),
              ),
            ),
          ...receipts.map(_buildCard),
        ],
      ),
    );
  }

  Widget _buildCard(PaymentReceipt r) {
    final isChat = r.type == ReceiptType.chatbot;
    final color = isChat ? NovaBrand.tertiary : NovaBrand.secondary;
    return GestureDetector(
      onTap: () => _showDetail(r),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: NovaBrand.cardBorder),
          boxShadow: NovaBrand.softShadow,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
              child: Icon(isChat ? Icons.smart_toy_outlined : Icons.map_outlined, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(r.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: NovaBrand.slateDark)),
                  const SizedBox(height: 2),
                  Text(isChat ? 'Chatbot purchase' : 'Tour package purchase',
                      style: GoogleFonts.inter(fontSize: 11, color: color, fontWeight: FontWeight.w700)),
                  Text('${r.orderId} · ${DateFormat('MMM d, yyyy').format(r.paidAt)}',
                      style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('\$${r.amount.toStringAsFixed(2)}',
                    style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w900, color: NovaBrand.primary)),
                const SizedBox(height: 4),
                Text(r.status.toUpperCase(),
                    style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: const Color(0xFF059669))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showDetail(PaymentReceipt r) {
    final isChat = r.type == ReceiptType.chatbot;
    Widget row(String label, String value, {bool bold = false}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted)),
              const SizedBox(width: 16),
              Flexible(
                child: Text(value,
                    textAlign: TextAlign.right,
                    style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: bold ? FontWeight.w900 : FontWeight.w600,
                        color: NovaBrand.slateDark)),
              ),
            ],
          ),
        );

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              Text(isChat ? 'Chatbot Purchase Receipt' : 'Tour Package Receipt',
                  style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: NovaBrand.primary)),
              const Divider(height: 24),
              row('Order ID', r.orderId, bold: true),
              row(isChat ? 'Plan' : 'Package', r.title),
              row('Details', r.description),
              if (r.period != null) row('Billing', 'per ${r.period}'),
              if (r.participants != null) row('Travelers', '${r.participants}'),
              row('Date', DateFormat('MMM d, yyyy · HH:mm').format(r.paidAt)),
              row('Payment', r.paymentMethod),
              row('Billed to', '${r.customerName} (${r.customerEmail})'),
              row('Status', r.status),
              const Divider(height: 24),
              row('Total Paid', '\$${r.amount.toStringAsFixed(2)}', bold: true),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: NovaBrand.primary,
                        content: Text('Receipt ${r.orderId} downloaded.', style: GoogleFonts.inter()),
                      ),
                    );
                  },
                  icon: const Icon(Icons.download, size: 16),
                  label: Text('Download Receipt', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
