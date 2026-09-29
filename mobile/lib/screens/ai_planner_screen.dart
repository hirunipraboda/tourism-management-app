import 'package:flutter/material.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';

class AiPlannerScreen extends StatefulWidget {
  const AiPlannerScreen({super.key});

  @override
  State<AiPlannerScreen> createState() => _AiPlannerScreenState();
}

class _AiPlannerScreenState extends State<AiPlannerScreen> {
  final _destinationsController = TextEditingController(text: 'Sigiriya, Kandy, Ella');
  final _budgetController = TextEditingController(text: '800');
  int _travelers = 2;
  bool _isLoading = false;
  TripPlanResult? _planResult;

  void _generatePlan() async {
    setState(() {
      _isLoading = true;
    });

    final destinations = _destinationsController.text.split(',').map((e) => e.trim()).toList();
    final budget = double.tryParse(_budgetController.text) ?? 800.0;

    final result = await ApiService.generateAITripPlan(
      destinations: destinations,
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      budget: budget,
      travelers: _travelers,
    );

    setState(() {
      _isLoading = false;
      _planResult = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'AI Smart Trip Planner',
          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Destinations (comma-separated)', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _destinationsController,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      hintText: 'e.g. Sigiriya, Kandy, Galle',
                      isDense: true,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Budget (USD)', style: TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _budgetController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                prefixText: '\$ ',
                                isDense: true,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Travelers', style: TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<int>(
                              value: _travelers,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                isDense: true,
                              ),
                              items: [1, 2, 3, 4, 5, 6].map((count) {
                                return DropdownMenuItem(value: count, child: Text('$count'));
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _travelers = val);
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: _isLoading ? null : _generatePlan,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Icon(Icons.auto_awesome),
                      label: Text(_isLoading ? 'Orchestrating 4 Agents...' : 'Generate 4-Agent Itinerary'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            if (_planResult != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      _planResult!.title,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                  ),
                  Chip(
                    backgroundColor: Colors.teal.shade50,
                    avatar: const Icon(Icons.verified, color: Color(0xFF0D9488), size: 18),
                    label: Text(
                      'AI Score ${_planResult!.aiScore.toInt()}%',
                      style: const TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _planResult!.days.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, idx) {
                  final day = _planResult!.days[idx];
                  return Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: const Color(0xFF0D9488),
                        child: Text('${day.day}', style: const TextStyle(color: Colors.white)),
                      ),
                      title: Text(day.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Text(day.description, style: const TextStyle(fontSize: 12)),
                      trailing: Text(
                        '\$${day.estimatedCost.toInt()}',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0D9488)),
                      ),
                    ),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
