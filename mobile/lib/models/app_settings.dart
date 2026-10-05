import 'package:flutter/foundation.dart';

class CurrencyOption {
  final String code;
  final String symbol;
  final String name;
  /// Units of this currency per 1 USD (indicative rates for display).
  final double perUsd;
  const CurrencyOption(this.code, this.symbol, this.name, this.perUsd);
}

const List<CurrencyOption> kCurrencies = [
  CurrencyOption('USD', '\$', 'US Dollar', 1.0),
  CurrencyOption('LKR', 'Rs', 'Sri Lankan Rupee', 300.0),
  CurrencyOption('EUR', '€', 'Euro', 0.92),
  CurrencyOption('GBP', '£', 'British Pound', 0.79),
  CurrencyOption('INR', '₹', 'Indian Rupee', 83.0),
  CurrencyOption('AUD', 'A\$', 'Australian Dollar', 1.52),
];

const List<String> kLanguages = ['English', 'සිංහල (Sinhala)', 'தமிழ் (Tamil)', 'Deutsch', 'Français'];

/// App-wide user preferences. Held in memory for the app session.
class AppSettings extends ChangeNotifier {
  AppSettings._();
  static final AppSettings instance = AppSettings._();

  CurrencyOption _currency = kCurrencies.first;
  String _language = 'English';
  bool notificationsEnabled = true;
  bool tripReminders = true;
  bool dealAlerts = false;
  bool emailReceipts = true;
  String distanceUnit = 'km'; // km | mi
  String temperatureUnit = '°C'; // °C | °F

  CurrencyOption get currency => _currency;
  String get language => _language;

  void setCurrency(CurrencyOption c) {
    _currency = c;
    notifyListeners();
  }

  void setLanguage(String l) {
    _language = l;
    notifyListeners();
  }

  void update(VoidCallback change) {
    change();
    notifyListeners();
  }

  String formatUsd(double usd) {
    final v = usd * _currency.perUsd;
    final digits = _currency.perUsd >= 50 ? 0 : 2;
    return '${_currency.symbol}${v.toStringAsFixed(digits)}';
  }

  String get summary =>
      '${_currency.code} (${_currency.symbol}) · ${_language.split(' ').first} · Notifications ${notificationsEnabled ? 'ON' : 'OFF'}';
}
