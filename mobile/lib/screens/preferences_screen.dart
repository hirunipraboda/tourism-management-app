import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/app_settings.dart';
import '../theme/app_theme.dart';

class PreferencesScreen extends StatelessWidget {
  const PreferencesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppSettings.instance;
    return ListenableBuilder(
      listenable: s,
      builder: (context, _) => Scaffold(
        backgroundColor: NovaBrand.slateLight,
        appBar: AppBar(
          title: Text('Preferences & Currency',
              style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: NovaBrand.primary)),
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _section('Currency', [
              ...kCurrencies.map((c) => RadioListTile<String>(
                    value: c.code,
                    groupValue: s.currency.code,
                    activeColor: NovaBrand.primary,
                    onChanged: (_) => s.setCurrency(c),
                    title: Text('${c.code} (${c.symbol})',
                        style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: NovaBrand.slateDark)),
                    subtitle: Text(c.name, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
                  )),
            ]),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: NovaBrand.tertiary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                'Preview: a \$680 tour package shows as ${s.formatUsd(680)}. Rates are indicative; payments are charged in USD.',
                style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.secondary, fontWeight: FontWeight.w600),
              ),
            ),
            const SizedBox(height: 16),
            _section('Language', [
              ...kLanguages.map((l) => RadioListTile<String>(
                    value: l,
                    groupValue: s.language,
                    activeColor: NovaBrand.primary,
                    onChanged: (_) => s.setLanguage(l),
                    title: Text(l, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
                  )),
            ]),
            const SizedBox(height: 16),
            _section('Notifications', [
              _switch('Push notifications', 'Booking updates and travel alerts', s.notificationsEnabled,
                  (v) => s.update(() => s.notificationsEnabled = v)),
              _switch('Trip reminders', 'Reminders before check-in and tours', s.tripReminders,
                  (v) => s.update(() => s.tripReminders = v),
                  enabled: s.notificationsEnabled),
              _switch('Deals & offers', 'Discounts on packages and transport', s.dealAlerts,
                  (v) => s.update(() => s.dealAlerts = v),
                  enabled: s.notificationsEnabled),
              _switch('Email receipts', 'Send payment receipts to your email', s.emailReceipts,
                  (v) => s.update(() => s.emailReceipts = v)),
            ]),
            const SizedBox(height: 16),
            _section('Units', [
              _segmented('Distance', ['km', 'mi'], s.distanceUnit, (v) => s.update(() => s.distanceUnit = v)),
              _segmented('Temperature', ['°C', '°F'], s.temperatureUnit, (v) => s.update(() => s.temperatureUnit = v)),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: NovaBrand.cardBorder),
        boxShadow: NovaBrand.softShadow,
      ),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 4),
            child: Text(title, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: NovaBrand.primary)),
          ),
          ...children,
        ],
      ),
    );
  }

  Widget _switch(String title, String subtitle, bool value, ValueChanged<bool> onChanged, {bool enabled = true}) {
    return SwitchListTile(
      value: value && enabled,
      onChanged: enabled ? onChanged : null,
      activeColor: NovaBrand.primary,
      title: Text(title, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
      subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
    );
  }

  Widget _segmented(String label, List<String> options, String value, ValueChanged<String> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
          SegmentedButton<String>(
            showSelectedIcon: false,
            segments: options.map((o) => ButtonSegment(value: o, label: Text(o))).toList(),
            selected: {value},
            onSelectionChanged: (set) => onChanged(set.first),
          ),
        ],
      ),
    );
  }
}
