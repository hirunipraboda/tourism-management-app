import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _entranceController;
  late final AnimationController _pulseController;
  late final AnimationController _particleController;

  late final Animation<double> _logoScale;
  late final Animation<double> _logoOpacity;
  late final Animation<double> _titleFade;
  late final Animation<Offset> _titleSlide;
  late final Animation<double> _taglineFade;
  late final Animation<Offset> _taglineSlide;
  late final Animation<double> _badgesFade;
  late final Animation<Offset> _badgesSlide;
  late final Animation<double> _progressAnimation;

  bool _isNavigated = false;
  String _statusText = 'Discovering the wonder of Sri Lanka...';

  @override
  void initState() {
    super.initState();

    // 1. Main entrance sequence (2.8 seconds total)
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    );

    // 2. Ambient breathing & glowing pulse
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    // 3. Subtle floating particle drift
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 5000),
    )..repeat();

    // Staggered Entrance Animations
    _logoScale = Tween<double>(begin: 0.55, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.0, 0.45, curve: Curves.easeOutBack),
      ),
    );

    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.0, 0.35, curve: Curves.easeIn),
      ),
    );

    _titleFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.30, 0.60, curve: Curves.easeOut),
      ),
    );

    _titleSlide = Tween<Offset>(
      begin: const Offset(0.0, 0.35),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.30, 0.60, curve: Curves.easeOutCubic),
      ),
    );

    _taglineFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.48, 0.75, curve: Curves.easeOut),
      ),
    );

    _taglineSlide = Tween<Offset>(
      begin: const Offset(0.0, 0.35),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.48, 0.75, curve: Curves.easeOutCubic),
      ),
    );

    _badgesFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.65, 0.88, curve: Curves.easeOut),
      ),
    );

    _badgesSlide = Tween<Offset>(
      begin: const Offset(0.0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.65, 0.88, curve: Curves.easeOutCubic),
      ),
    );

    _progressAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.20, 0.96, curve: Curves.easeInOutCubic),
      ),
    );

    // Update status text as progress evolves
    _entranceController.addListener(() {
      final value = _entranceController.value;
      if (value > 0.75 && _statusText != 'Ready for adventure!') {
        setState(() {
          _statusText = 'Ready for adventure!';
        });
      } else if (value > 0.40 && value <= 0.75 && _statusText != 'Curating bespoke island experiences...') {
        setState(() {
          _statusText = 'Curating bespoke island experiences...';
        });
      }
    });

    _entranceController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _navigateToLogin();
      }
    });

    _entranceController.forward();
  }

  void _navigateToLogin() {
    if (_isNavigated) return;
    _isNavigated = true;

    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, animation, secondaryAnimation) => const LoginScreen(),
          transitionsBuilder: (_, animation, secondaryAnimation, child) {
            final curved = CurvedAnimation(
              parent: animation,
              curve: Curves.easeInOutCubic,
            );
            return FadeTransition(
              opacity: curved,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.96, end: 1.0).animate(curved),
                child: child,
              ),
            );
          },
          transitionDuration: const Duration(milliseconds: 650),
        ),
      );
    }
  }

  @override
  void dispose() {
    _entranceController.dispose();
    _pulseController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: const Color(0xFF030D16),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Dynamic Deep Aurora Mesh Background
          _buildDynamicBackground(size),

          // 2. Animated Floating Particles Canvas
          AnimatedBuilder(
            animation: _particleController,
            builder: (context, _) {
              return CustomPaint(
                size: size,
                painter: _AmbientParticlesPainter(
                  progress: _particleController.value,
                ),
              );
            },
          ),

          // 3. Central Brand Content
          SafeArea(
            child: Column(
              children: [
                // Top Action Bar with Skip button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Subtitle / Explorer tag
                      AnimatedBuilder(
                        animation: _taglineFade,
                        builder: (context, _) => Opacity(
                          opacity: _taglineFade.value.clamp(0.0, 1.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Color(0xFF10B981),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Color(0xFF10B981),
                                      blurRadius: 8,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'EXPLORE SRI LANKA',
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 2.0,
                                  color: const Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Interactive Glassmorphism Skip Button
                      _buildSkipButton(),
                    ],
                  ),
                ),

                const Spacer(flex: 2),

                // Centerpiece: Glowing Brand Emblem
                _buildHeroLogo(),

                const SizedBox(height: 28),

                // Brand Typography Reveal
                _buildBrandTypography(),

                const SizedBox(height: 18),

                // Curated Island Pill Badges
                _buildFeatureBadges(),

                const Spacer(flex: 3),

                // Bottom Loading & Experience Bar
                _buildBottomProgress(bottomPadding),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Interactive Skip Button with smooth tap response
  Widget _buildSkipButton() {
    return GestureDetector(
      onTap: _navigateToLogin,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.18),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.35),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Skip',
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                letterSpacing: 0.6,
              ),
            ),
            const SizedBox(width: 6),
            const Icon(
              Icons.arrow_forward_rounded,
              size: 14,
              color: Color(0xFF38BDF8),
            ),
          ],
        ),
      ),
    );
  }

  /// Multi-tier Rich Background with Radial Glows
  Widget _buildDynamicBackground(Size size) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, _) {
        final pulse = _pulseController.value;
        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF04101A), // Pure deep ocean night
                Color(0xFF071F2F), // Midnight sapphire
                Color(0xFF0B3A53), // TourLink brand primary
                Color(0xFF04131E), // Slate dark edge
              ],
              stops: [0.0, 0.35, 0.75, 1.0],
            ),
          ),
          child: Stack(
            children: [
              // Top-left Ocean Glow Orb
              Positioned(
                top: -80 + (pulse * 20),
                left: -80 + (pulse * 15),
                child: Container(
                  width: 320,
                  height: 320,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF146C86).withValues(alpha: 0.40 + (pulse * 0.15)),
                        const Color(0xFF146C86).withValues(alpha: 0.0),
                      ],
                    ),
                  ),
                ),
              ),

              // Center Electric Cyan Glow
              Positioned(
                top: (size.height * 0.28) - 100,
                left: (size.width * 0.5) - 160,
                child: Container(
                  width: 320,
                  height: 320,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF38BDF8).withValues(alpha: 0.22 + (pulse * 0.12)),
                        const Color(0xFF16A6A1).withValues(alpha: 0.08),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.5, 1.0],
                    ),
                  ),
                ),
              ),

              // Bottom-Right Amber Sunset Accent Orb
              Positioned(
                bottom: -60 - (pulse * 15),
                right: -60 - (pulse * 15),
                child: Container(
                  width: 300,
                  height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFFF59E0B).withValues(alpha: 0.16 + (pulse * 0.08)),
                        const Color(0xFFF59E0B).withValues(alpha: 0.0),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  /// Hero Centerpiece: Pulsing multi-ring badge with TourLink Logo
  Widget _buildHeroLogo() {
    return AnimatedBuilder(
      animation: Listenable.merge([_entranceController, _pulseController]),
      builder: (context, _) {
        final scale = _logoScale.value;
        final opacity = _logoOpacity.value.clamp(0.0, 1.0);
        final pulse = _pulseController.value;

        return Opacity(
          opacity: opacity,
          child: Transform.scale(
            scale: scale,
            child: SizedBox(
              width: 190,
              height: 190,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Outer Ambient Pulse Ring 1
                  Container(
                    width: 180 + (pulse * 24),
                    height: 180 + (pulse * 24),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFF38BDF8).withValues(alpha: (1.0 - pulse) * 0.35),
                        width: 1.5,
                      ),
                    ),
                  ),

                  // Outer Ambient Pulse Ring 2
                  Container(
                    width: 150 + (pulse * 16),
                    height: 150 + (pulse * 16),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFF16A6A1).withValues(alpha: (1.0 - pulse) * 0.45),
                        width: 1.8,
                      ),
                    ),
                  ),

                  // Glowing Center Aura
                  Container(
                    width: 130,
                    height: 130,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF38BDF8).withValues(alpha: 0.45 + (pulse * 0.2)),
                          blurRadius: 45,
                          spreadRadius: 8,
                        ),
                        BoxShadow(
                          color: const Color(0xFF16A6A1).withValues(alpha: 0.40),
                          blurRadius: 25,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),

                  // Glassmorphic Pedestal Card
                  Container(
                    width: 114,
                    height: 114,
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withValues(alpha: 0.95),
                          const Color(0xFFF1F5F9),
                          const Color(0xFFE2E8F0),
                        ],
                      ),
                      border: Border.all(
                        color: const Color(0xFF38BDF8).withValues(alpha: 0.8),
                        width: 2.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.4),
                          blurRadius: 24,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/website-logo.png',
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const Center(
                          child: Icon(
                            Icons.travel_explore_rounded,
                            size: 56,
                            color: Color(0xFF0B3A53),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Floating 4-Point Sparkle Icon (Brand element)
                  Positioned(
                    top: 14,
                    right: 20,
                    child: Transform.rotate(
                      angle: pulse * 0.3,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF38BDF8),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF38BDF8).withValues(alpha: 0.8),
                              blurRadius: 10,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.auto_awesome,
                          size: 15,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  /// Animated Title and Slogan
  Widget _buildBrandTypography() {
    return Column(
      children: [
        // Brand Title: TourLink
        SlideTransition(
          position: _titleSlide,
          child: FadeTransition(
            opacity: _titleFade,
            child: Column(
              children: [
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [
                      Colors.white,
                      Color(0xFFE0F2FE),
                      Color(0xFF38BDF8),
                    ],
                    stops: [0.0, 0.65, 1.0],
                  ).createShader(bounds),
                  child: Text(
                    'TourLink',
                    style: GoogleFonts.outfit(
                      fontSize: 40,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.2,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                // Glowing cyan accent divider
                Container(
                  width: 48,
                  height: 3,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3),
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF16A6A1),
                        Color(0xFF38BDF8),
                        Color(0xFFF59E0B),
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF38BDF8).withValues(alpha: 0.7),
                        blurRadius: 10,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Official Slogan Tagline
        SlideTransition(
          position: _taglineSlide,
          child: FadeTransition(
            opacity: _taglineFade,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFF0F2D42).withValues(alpha: 0.65),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFF38BDF8).withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Text(
                'SMART JOURNEYS  •  LASTING MEMORIES',
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF38BDF8),
                  letterSpacing: 1.8,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Feature Highlights Pill Badges
  Widget _buildFeatureBadges() {
    return SlideTransition(
      position: _badgesSlide,
      child: FadeTransition(
        opacity: _badgesFade,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Wrap(
            alignment: WrapAlignment.center,
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildBadgePill(Icons.place_rounded, 'Scenic Gems', const Color(0xFF38BDF8)),
              _buildBadgePill(Icons.smart_toy_rounded, 'AI Guide', const Color(0xFF16A6A1)),
              _buildBadgePill(Icons.star_rounded, 'Verified Reviews', const Color(0xFFF59E0B)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadgePill(IconData icon, String label, Color accentColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: accentColor.withValues(alpha: 0.25),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 13,
            color: accentColor,
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFCBD5E1),
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  /// Bottom Progress Section with dynamic ticker & glowing progress track
  Widget _buildBottomProgress(double bottomPadding) {
    return Padding(
      padding: EdgeInsets.fromLTRB(32, 0, 32, math.max(16, bottomPadding + 10)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Dynamic status message
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 350),
            child: Text(
              _statusText,
              key: ValueKey<String>(_statusText),
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF94A3B8),
                letterSpacing: 0.4,
              ),
            ),
          ),

          const SizedBox(height: 14),

          // Sleek glowing progress indicator bar
          AnimatedBuilder(
            animation: _progressAnimation,
            builder: (context, _) {
              final progress = _progressAnimation.value.clamp(0.0, 1.0);
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  // Background Track
                  Container(
                    height: 5,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),

                  // Animated Active Progress Fill
                  FractionallySizedBox(
                    widthFactor: progress,
                    child: Container(
                      height: 5,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFF146C86),
                            Color(0xFF16A6A1),
                            Color(0xFF38BDF8),
                            Color(0xFFF59E0B),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF38BDF8).withValues(alpha: 0.6),
                            blurRadius: 8,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          const SizedBox(height: 18),

          // Platform info
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'TourLink',
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF64748B),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Container(
                  width: 3,
                  height: 3,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFF64748B),
                  ),
                ),
              ),
              Text(
                'Powered by Nova Travel Intelligence',
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Custom painter for smooth ambient floating luminous particles
class _AmbientParticlesPainter extends CustomPainter {
  final double progress;

  _AmbientParticlesPainter({required this.progress});

  // Fixed pseudo-random particle seed coordinates
  static final List<Offset> _particleSeeds = [
    const Offset(0.12, 0.18),
    const Offset(0.85, 0.15),
    const Offset(0.24, 0.35),
    const Offset(0.78, 0.42),
    const Offset(0.15, 0.65),
    const Offset(0.88, 0.68),
    const Offset(0.32, 0.82),
    const Offset(0.68, 0.88),
    const Offset(0.50, 0.22),
    const Offset(0.08, 0.48),
    const Offset(0.92, 0.32),
    const Offset(0.45, 0.74),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    for (int i = 0; i < _particleSeeds.length; i++) {
      final seed = _particleSeeds[i];

      // Subtle float motion based on sine waves
      final offsetX = math.sin((progress * 2 * math.pi) + (i * 0.7)) * 12.0;
      final offsetY = math.cos((progress * 2 * math.pi) + (i * 0.9)) * 16.0;

      final x = (seed.dx * size.width) + offsetX;
      final y = (seed.dy * size.height) + offsetY;

      // Pulse opacity
      final alphaFactor = 0.25 + 0.45 * (0.5 + 0.5 * math.sin((progress * 2 * math.pi) + (i * 1.3)));

      final Color particleColor = (i % 3 == 0)
          ? const Color(0xFF38BDF8)
          : (i % 3 == 1)
              ? const Color(0xFF16A6A1)
              : const Color(0xFFF59E0B);

      paint.color = particleColor.withValues(alpha: alphaFactor * 0.5);

      final double radius = (i % 2 == 0) ? 2.5 : 1.8;
      canvas.drawCircle(Offset(x, y), radius, paint);

      // Glow halo on larger particles
      if (i % 3 == 0) {
        paint.color = particleColor.withValues(alpha: alphaFactor * 0.18);
        canvas.drawCircle(Offset(x, y), radius * 3.0, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _AmbientParticlesPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
