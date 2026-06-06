import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Dimensions, ImageBackground, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

const COUPLE_PHOTOS = [
  require('../../assets/images/wedding_couple_bg.png'),
  require('../../assets/images/wedding_table_bg.png'),
  require('../../assets/images/wedding_venue_bg.png'),
];

const TEMPLATES = [
  {
    id: 't_arch',
    name: 'The Timeless Arch',
    style: 'Elegant Arch-framed layout with curved lettering, sound wave, arch date borders, and vertical schedule timelines.',
    priceLabel: '$20',
    accentColor: '#111111',
    textColor: '#333333',
    sampleBg: '#faf8f5',
    vibe: 'High-fashion, editorial, curated',
    features: [
      'Elegant Arch-Framed Photo Layout',
      'Detailed Vertical Event Timeline',
      'Curated Dress Code & Color Palette',
      'Travel Info & Accommodations',
      'Seamless Gift Registry & RSVP'
    ]
  },
  {
    id: 't_essential',
    name: 'The Modern Essential',
    style: 'Minimalist layout with full-screen couple photo, sound wave tracker, RSVP with guest tracking, and entourage grid.',
    priceLabel: '$20',
    accentColor: '#2c2c2c',
    textColor: '#333333',
    sampleBg: '#f5f0e8',
    vibe: 'Modern, chic, airy',
    features: [
      'Advanced Dress Code & Color swatches',
      'Interactive Event Timeline Planner',
      'RSVP with Guest Count & Meals',
      'Multi-link Gift Registry Options',
      'Entourage (Wedding Party) Showcase'
    ]
  },
  {
    id: 't_noir',
    name: 'The Noir Editorial',
    style: 'Magazine layout featuring high-contrast black & white couple images, travel guides, gift lists, and interactive forms.',
    priceLabel: '$14.99',
    accentColor: '#fbfaf8',
    textColor: '#e5dfd5',
    sampleBg: '#121212',
    vibe: 'Dramatic, editorial, black & white',
    features: [
      'Magazine-Style Typography Layout',
      'B&W Photography & Dark-Mode theme',
      'Icon-Driven Schedule Timelines',
      'Accommodations & Gift Registries',
      'Custom B&W Photo Filter Swaps'
    ]
  },
  {
    id: 't_obsidian',
    name: 'The Obsidian Romance',
    style: 'Dramatic black velvet theme accented with gold borders, staggered event cards, and multi-link registries.',
    priceLabel: '$14.99',
    accentColor: '#d4af37',
    textColor: '#f5f0e8',
    sampleBg: '#020208',
    vibe: 'Luxury, dramatic, imperial',
    features: [
      'Dramatic Pure Dark Aesthetic',
      'Three Full-Bleed Portrait Grids',
      'Staggered Wedding Schedule Timelines',
      'Hex Color Dress Swatches Renders',
      'Multi-Link Integrated Gift Registries'
    ]
  }
];

export default function InvitationsScreen() {
  const pathname = usePathname();
  const isFocused = pathname.includes('/invitations');
  const [selectedTpl, setSelectedTpl] = useState<typeof TEMPLATES[0] | null>(null);
  
  // Customization fields
  const [title, setTitle] = useState('Sarah & David');
  const [date, setDate] = useState('Saturday, July 15, 2027');
  const [location, setLocation] = useState('Sunset Cove, Malibu, CA');
  const [details, setDetails] = useState('Reception to follow immediately after ceremony');
  const [couplePhotoIndex, setCouplePhotoIndex] = useState(0);
  
  const [dressCodeText, setDressCodeText] = useState('Wear formal wedding attire. We recommend neutral earthy tones.');
  const [dressColors, setDressColors] = useState(['#bdc3c7', '#d4a373', '#e9c46a', '#faedcd']);
  
  const [registry, setRegistry] = useState([
    { name: 'Amazon Wedding Registry', url: 'https://amazon.com' },
    { name: 'Target Gift Registry', url: 'https://target.com' }
  ]);
  
  const [entourage, setEntourage] = useState([
    { role: 'Maid of Honor', name: 'Juliana Smith' },
    { role: 'Best Man', name: 'James Carter' },
    { role: 'Bridesmaid', name: 'Emily Rose' },
    { role: 'Groomsman', name: 'Michael Brown' }
  ]);

  const [timeline, setTimeline] = useState([
    { time: '04:30 PM', title: 'Guest Arrival & Drinks', description: 'Begin the evening with a refreshing glass of champagne and live acoustic music.' },
    { time: '05:00 PM', title: 'The Ceremony', description: "Please take your seats as we exchange our vows and say 'I do' under the floral arch." },
    { time: '06:00 PM', title: 'Cocktail Hour', description: "Enjoy hors d'oeuvres, signature cocktails, and live jazz on the terrace." },
    { time: '07:30 PM', title: 'Dinner & Dancing', description: 'Join us for a three-course dinner, toasts, and dancing under the stars.' }
  ]);

  // Phone Mockup States
  const [activeTab, setActiveTab] = useState<'invite' | 'dress' | 'timeline' | 'registry' | 'party' | 'rsvp'>('invite');
  const [rsvpAttending, setRsvpAttending] = useState<'yes' | 'no'>('yes');
  const [rsvpCount, setRsvpCount] = useState('1');
  const [rsvpMeal, setRsvpMeal] = useState('beef');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Expandable editor sections
  const [expandedSection, setExpandedSection] = useState<'general' | 'dress' | 'registry' | 'party' | 'timeline'>('general');

  const handleSelect = (name: string) => {
    Alert.alert('Selection Saved', `You selected "${name}". Proceeding to billing upon publishing.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', display: isFocused ? 'flex' : 'none' }}>
      <BackgroundSlideshow />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.badge}>DESIGN HUB</Text>
          <Text style={styles.title}>Wedding Website & Invitations</Text>
          <Text style={styles.subtitle}>
            Select a premium template, customize text & media, and generate invite links for your guest list.
          </Text>
        </View>

      {/* Cards list */}
      <View style={styles.list}>
        {TEMPLATES.map((tpl) => (
          <View key={tpl.id} style={styles.card}>
            <View style={[styles.cardBanner, { backgroundColor: tpl.sampleBg }]}>
              <Text style={[styles.bannerText, { color: tpl.accentColor }]}>{tpl.name}</Text>
              <Text style={[styles.bannerSubtext, { color: tpl.accentColor }]}>SAVE THE DATE</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{tpl.name}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{tpl.priceLabel}</Text>
                </View>
              </View>

              <Text style={styles.styleDesc}>{tpl.style}</Text>

              {/* Bullet Features list */}
              <View style={styles.featureListContainer}>
                {tpl.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItemRow}>
                    <Text style={styles.featureBullet}>✓</Text>
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.vibeRow}>
                <Text style={styles.vibeLabel}>VIBE:</Text>
                <Text style={styles.vibeValue}>{tpl.vibe}</Text>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity 
                  style={styles.previewBtn} 
                  onPress={() => {
                    setActiveTab('invite');
                    setRsvpSuccess(false);
                    setSelectedTpl(tpl);
                  }}
                >
                  <FontAwesome name="eye" size={14} color="#c9a96e" />
                  <Text style={styles.previewBtnText}>Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.selectBtn}
                  onPress={() => handleSelect(tpl.name)}
                >
                  <Text style={styles.selectBtnText}>Buy & Customize</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Preview Modal showing simulated smartphone invitation mockup */}
      {selectedTpl && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSelectedTpl(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalNavbar}>
              <TouchableOpacity 
                style={styles.closeModalBtn}
                onPress={() => setSelectedTpl(null)}
              >
                <FontAwesome name="times" size={20} color="#ff7b7b" />
                <Text style={styles.closeModalText}>Exit</Text>
              </TouchableOpacity>
              <Text style={styles.modalNavbarTitle}>Design Simulator</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              
              {/* Form Controls */}
              <View style={styles.editorBox}>
                <Text style={styles.editorTitle}>Live Customization</Text>
                
                {/* Accordion 1: General Info */}
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setExpandedSection(expandedSection === 'general' ? 'general' : 'general')}
                >
                  <Text style={styles.accordionTitle}>📋 General Details</Text>
                  <FontAwesome name={expandedSection === 'general' ? 'chevron-down' : 'chevron-right'} size={12} color="#c9a96e" />
                </TouchableOpacity>
                {expandedSection === 'general' && (
                  <View style={styles.accordionBody}>
                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Names Heading</Text>
                      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Select Couple Photo</Text>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                        {COUPLE_PHOTOS.map((imgSrc, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => setCouplePhotoIndex(idx)}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 8,
                              borderWidth: 2,
                              borderColor: couplePhotoIndex === idx ? '#c9a96e' : 'transparent',
                              overflow: 'hidden'
                            }}
                          >
                            <Image source={imgSrc} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Wedding Date</Text>
                      <TextInput style={styles.input} value={date} onChangeText={setDate} />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Wedding Location</Text>
                      <TextInput style={styles.input} value={location} onChangeText={setLocation} />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Ceremony Details</Text>
                      <TextInput style={[styles.input, { height: 60 }]} multiline value={details} onChangeText={setDetails} />
                    </View>
                  </View>
                )}

                {/* Accordion 2: Dress Code */}
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setExpandedSection(expandedSection === 'dress' ? 'general' : 'dress')}
                >
                  <Text style={styles.accordionTitle}>👗 Dress Code</Text>
                  <FontAwesome name={expandedSection === 'dress' ? 'chevron-down' : 'chevron-right'} size={12} color="#c9a96e" />
                </TouchableOpacity>
                {expandedSection === 'dress' && (
                  <View style={styles.accordionBody}>
                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Attire Guidelines</Text>
                      <TextInput style={[styles.input, { height: 60 }]} multiline value={dressCodeText} onChangeText={setDressCodeText} />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Color Swatches (Hex Codes)</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        {dressColors.map((color, idx) => (
                          <TextInput
                            key={idx}
                            style={[styles.input, { width: 62, paddingHorizontal: 4, textAlign: 'center', fontSize: 11 }]}
                            value={color}
                            onChangeText={(val) => {
                              const newColors = [...dressColors];
                              newColors[idx] = val;
                              setDressColors(newColors);
                            }}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Accordion 3: Gift Registry */}
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setExpandedSection(expandedSection === 'registry' ? 'general' : 'registry')}
                >
                  <Text style={styles.accordionTitle}>🎁 Registry links</Text>
                  <FontAwesome name={expandedSection === 'registry' ? 'chevron-down' : 'chevron-right'} size={12} color="#c9a96e" />
                </TouchableOpacity>
                {expandedSection === 'registry' && (
                  <View style={styles.accordionBody}>
                    {registry.map((reg, idx) => (
                      <View key={idx} style={{ gap: 6, marginBottom: 8 }}>
                        <Text style={{ fontSize: 11, color: '#c9a96e', fontWeight: 'bold' }}>Registry {idx + 1}</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Store Name"
                          value={reg.name}
                          onChangeText={(val) => {
                            const newReg = [...registry];
                            newReg[idx].name = val;
                            setRegistry(newReg);
                          }}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Registry URL"
                          value={reg.url}
                          onChangeText={(val) => {
                            const newReg = [...registry];
                            newReg[idx].url = val;
                            setRegistry(newReg);
                          }}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {/* Accordion 4: Entourage */}
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setExpandedSection(expandedSection === 'party' ? 'general' : 'party')}
                >
                  <Text style={styles.accordionTitle}>👥 Entourage List</Text>
                  <FontAwesome name={expandedSection === 'party' ? 'chevron-down' : 'chevron-right'} size={12} color="#c9a96e" />
                </TouchableOpacity>
                {expandedSection === 'party' && (
                  <View style={styles.accordionBody}>
                    {entourage.map((member, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                        <TextInput
                          style={[styles.input, { flex: 1, fontSize: 12 }]}
                          placeholder="Role"
                          value={member.role}
                          onChangeText={(val) => {
                            const newEnt = [...entourage];
                            newEnt[idx].role = val;
                            setEntourage(newEnt);
                          }}
                        />
                        <TextInput
                          style={[styles.input, { flex: 1.5, fontSize: 12 }]}
                          placeholder="Name"
                          value={member.name}
                          onChangeText={(val) => {
                            const newEnt = [...entourage];
                            newEnt[idx].name = val;
                            setEntourage(newEnt);
                          }}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {/* Accordion 5: Timeline */}
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setExpandedSection(expandedSection === 'timeline' ? 'general' : 'timeline')}
                >
                  <Text style={styles.accordionTitle}>📅 Timeline items</Text>
                  <FontAwesome name={expandedSection === 'timeline' ? 'chevron-down' : 'chevron-right'} size={12} color="#c9a96e" />
                </TouchableOpacity>
                {expandedSection === 'timeline' && (
                  <View style={styles.accordionBody}>
                    {timeline.map((item, idx) => (
                      <View key={idx} style={{ padding: 10, borderWidth: 1, borderColor: 'rgba(201,169,110,0.15)', borderRadius: 10, gap: 6, marginBottom: 10 }}>
                        <Text style={{ fontSize: 11, color: '#c9a96e', fontWeight: 'bold' }}>Event {idx + 1}</Text>
                        <TextInput
                          style={[styles.input, { paddingVertical: 4, fontSize: 12 }]}
                          placeholder="Time"
                          value={item.time}
                          onChangeText={(val) => {
                            const newTimeline = [...timeline];
                            newTimeline[idx].time = val;
                            setTimeline(newTimeline);
                          }}
                        />
                        <TextInput
                          style={[styles.input, { paddingVertical: 4, fontSize: 12 }]}
                          placeholder="Title"
                          value={item.title}
                          onChangeText={(val) => {
                            const newTimeline = [...timeline];
                            newTimeline[idx].title = val;
                            setTimeline(newTimeline);
                          }}
                        />
                        <TextInput
                          style={[styles.input, { paddingVertical: 4, fontSize: 12, height: 40 }]}
                          multiline
                          placeholder="Description"
                          value={item.description}
                          onChangeText={(val) => {
                            const newTimeline = [...timeline];
                            newTimeline[idx].description = val;
                            setTimeline(newTimeline);
                          }}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Simulated Phone Shell Mockup */}
              <Text style={styles.mockupHeader}>Device Mockup Preview</Text>
              
              <View style={styles.phoneShell}>
                <View style={styles.notch}></View>
                <View style={[styles.phoneScreen, { backgroundColor: selectedTpl.sampleBg, padding: 0 }]}>
                  <ScrollView 
                    style={{ width: '100%', height: '100%' }}
                    contentContainerStyle={{ flexGrow: 1, padding: 12, alignItems: 'center' }}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Active Tab rendering */}
                    {activeTab === 'invite' && (
                      selectedTpl.id === 't_arch' ? (
                        <View style={styles.elysianInviteContainer}>
                          {/* Header Arch Banner */}
                          <View style={styles.elysianHeroSection}>
                            <Text style={styles.elysianArcText}>YOU'RE CORDIALLY INVITED</Text>
                            <View style={styles.elysianArchedImageFrame}>
                              <Image source={COUPLE_PHOTOS[couplePhotoIndex]} style={styles.elysianCouplePhoto} />
                            </View>
                          </View>

                          {/* Waveform Section */}
                          <View style={styles.elysianWaveformSection}>
                            <View style={styles.waveformIcon}>
                              <View style={[styles.waveBar, { height: 10 }]} />
                              <View style={[styles.waveBar, { height: 16 }]} />
                              <View style={[styles.waveBar, { height: 24 }]} />
                              <View style={[styles.waveBar, { height: 14 }]} />
                              <View style={[styles.waveBar, { height: 28 }]} />
                              <View style={[styles.waveBar, { height: 18 }]} />
                              <View style={[styles.waveBar, { height: 22 }]} />
                              <View style={[styles.waveBar, { height: 12 }]} />
                              <View style={[styles.waveBar, { height: 8 }]} />
                            </View>
                            <Text style={styles.elysianWaveformSubtitle}>TO SHARE IN THE CELEBRATION OF</Text>
                            <Text style={styles.elysianCoupleNames}>{title}</Text>
                          </View>

                          {/* Arched Date Section */}
                          <View style={styles.elysianDateSection}>
                            <View style={styles.elysianDateArchFrame}>
                              <Text style={styles.elysianJoinUs}>JOIN US ON</Text>
                              <Text style={styles.elysianDateLarge}>11.20.2026</Text>
                              <View style={styles.elysianDetailsBlock}>
                                <Text style={styles.elysianTimeDetails}>{details}</Text>
                                <Text style={styles.elysianLocationDetails}>{location}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View style={[styles.cardInside, { borderColor: selectedTpl.accentColor, width: '100%', padding: 12 }]}>
                          <Text style={[styles.inviteOverline, { color: selectedTpl.accentColor }]}>
                            YOU ARE CORDIALLY INVITED TO THE WEDDING OF
                          </Text>

                          <Text style={[styles.inviteNames, { color: selectedTpl.accentColor, fontSize: 18 }]}>
                            {title}
                          </Text>

                          <View style={[styles.lineDivider, { borderBottomColor: selectedTpl.accentColor }]}></View>

                          <View style={styles.standardMockupPhotoFrame}>
                            <Image source={COUPLE_PHOTOS[couplePhotoIndex]} style={styles.standardMockupPhoto} />
                          </View>

                          <Text style={[styles.inviteDate, { color: selectedTpl.textColor, fontSize: 10 }]}>
                            {date}
                          </Text>

                          <Text style={[styles.inviteLocation, { color: selectedTpl.textColor, fontSize: 9 }]}>
                            {location}
                          </Text>

                          <View style={[styles.lineDividerShort, { borderBottomColor: selectedTpl.accentColor }]}></View>

                          <Text style={[styles.inviteDetails, { color: selectedTpl.textColor, fontSize: 8 }]}>
                            {details}
                          </Text>
                        </View>
                      )
                    )}

                    {activeTab === 'dress' && (
                      <View style={styles.mockupSectionContainer}>
                        <Text style={[styles.mockupSectionTitle, { color: selectedTpl.accentColor }]}>DRESS CODE</Text>
                        <View style={[styles.lineDividerShort, { borderBottomColor: selectedTpl.accentColor, alignSelf: 'center', marginVertical: 8 }]}></View>
                        <Text style={[styles.mockupSectionText, { color: selectedTpl.textColor }]}>{dressCodeText}</Text>
                        
                        <Text style={styles.mockupSectionSub}>RECOMMENDED SHADES</Text>
                        <View style={styles.swatchesContainer}>
                          {dressColors.map((color, i) => (
                            <View key={i} style={styles.swatchItem}>
                              <View style={[styles.swatchCircle, { backgroundColor: color }]} />
                              <Text style={[styles.swatchHex, { color: selectedTpl.textColor }]}>{color}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {activeTab === 'timeline' && (
                      <View style={[styles.mockupSectionContainer, { paddingBottom: 24 }]}>
                        <Text style={[styles.mockupSectionTitle, { color: selectedTpl.accentColor }]}>TIMELINE</Text>
                        <View style={[styles.lineDividerShort, { borderBottomColor: selectedTpl.accentColor, alignSelf: 'center', marginVertical: 8 }]}></View>
                        
                        <View style={styles.timelineList}>
                          <View style={styles.elysianTimelineLine} />
                          {timeline.map((item, idx) => (
                            <View key={idx} style={styles.timelineItemCard}>
                              <View style={styles.elysianTimelineDot} />
                              <View style={styles.elysianTimelineContent}>
                                <Text style={styles.elysianTimelineTime}>{item.time}</Text>
                                <Text style={[styles.elysianTimelineTitle, { color: selectedTpl.accentColor }]}>{item.title}</Text>
                                <Text style={styles.elysianTimelineDesc}>{item.description}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {activeTab === 'registry' && (
                      <View style={styles.mockupSectionContainer}>
                        <Text style={[styles.mockupSectionTitle, { color: selectedTpl.accentColor }]}>REGISTRY</Text>
                        <View style={[styles.lineDividerShort, { borderBottomColor: selectedTpl.accentColor, alignSelf: 'center', marginVertical: 8 }]}></View>
                        <Text style={[styles.mockupSectionText, { color: selectedTpl.textColor }]}>
                          Your presence is present enough, but if you wish to gift us, we are registered at:
                        </Text>
                        <View style={styles.registryLinksGrid}>
                          {registry.map((reg, idx) => (
                            <TouchableOpacity 
                              key={idx} 
                              style={[styles.registryMockupBtn, { borderColor: selectedTpl.accentColor }]}
                            >
                              <Text style={{ color: selectedTpl.accentColor, fontSize: 10, fontWeight: '700' }}>
                                {reg.name} →
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {activeTab === 'party' && (
                      <View style={[styles.mockupSectionContainer, { paddingBottom: 24 }]}>
                        <Text style={[styles.mockupSectionTitle, { color: selectedTpl.accentColor }]}>WEDDING PARTY</Text>
                        <View style={[styles.lineDividerShort, { borderBottomColor: selectedTpl.accentColor, alignSelf: 'center', marginVertical: 8 }]}></View>
                        
                        <View style={styles.entourageListGrid}>
                          {entourage.map((member, idx) => (
                            <View key={idx} style={styles.entourageMockupCard}>
                              <View style={[styles.entourageMockupAvatar, { borderColor: selectedTpl.accentColor }]}>
                                <Text style={{ color: selectedTpl.accentColor, fontWeight: '700', fontSize: 12 }}>
                                  {member.name ? member.name.charAt(0) : '?'}
                                </Text>
                              </View>
                              <Text style={[styles.entourageMockupRole, { color: selectedTpl.textColor }]}>{member.role}</Text>
                              <Text style={[styles.entourageMockupName, { color: selectedTpl.accentColor }]}>{member.name}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {activeTab === 'rsvp' && (
                      <View style={styles.mockupSectionContainer}>
                        <Text style={[styles.mockupSectionTitle, { color: selectedTpl.accentColor }]}>RSVP ONLINE</Text>
                        <View style={[styles.lineDividerShort, { borderBottomColor: selectedTpl.accentColor, alignSelf: 'center', marginVertical: 8 }]}></View>
                        
                        {rsvpSuccess ? (
                          <View style={styles.rsvpSuccessCard}>
                            <View style={styles.successIcon}>
                              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                            </View>
                            <Text style={styles.successTitle}>RSVP Confirmed</Text>
                            <Text style={styles.successText}>Your RSVP submission has been successfully simulated!</Text>
                            <TouchableOpacity 
                              style={[styles.rsvpResetBtn, { backgroundColor: selectedTpl.accentColor }]}
                              onPress={() => setRsvpSuccess(false)}
                            >
                              <Text style={{ color: selectedTpl.sampleBg, fontSize: 9, fontWeight: '700' }}>RSVP Again</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={{ gap: 10, width: '100%' }}>
                            <View style={styles.rsvpFormGroup}>
                              <Text style={[styles.rsvpFormLabel, { color: selectedTpl.textColor }]}>Will you attend?</Text>
                              <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
                                <TouchableOpacity 
                                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                  onPress={() => setRsvpAttending('yes')}
                                >
                                  <FontAwesome name={rsvpAttending === 'yes' ? 'dot-circle-o' : 'circle-o'} size={14} color={selectedTpl.accentColor} />
                                  <Text style={{ color: selectedTpl.textColor, fontSize: 11 }}>Attending</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                  onPress={() => setRsvpAttending('no')}
                                >
                                  <FontAwesome name={rsvpAttending === 'no' ? 'dot-circle-o' : 'circle-o'} size={14} color={selectedTpl.accentColor} />
                                  <Text style={{ color: selectedTpl.textColor, fontSize: 11 }}>Decline</Text>
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View style={styles.rsvpFormGroup}>
                              <Text style={[styles.rsvpFormLabel, { color: selectedTpl.textColor }]}>Guests count: {rsvpCount}</Text>
                              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                                {['1', '2', '3', '4'].map((val) => (
                                  <TouchableOpacity
                                    key={val}
                                    style={{
                                      paddingVertical: 4,
                                      paddingHorizontal: 8,
                                      borderWidth: 1,
                                      borderRadius: 4,
                                      borderColor: selectedTpl.accentColor,
                                      backgroundColor: rsvpCount === val ? selectedTpl.accentColor : 'transparent'
                                    }}
                                    onPress={() => setRsvpCount(val)}
                                  >
                                    <Text style={{ color: rsvpCount === val ? selectedTpl.sampleBg : selectedTpl.accentColor, fontSize: 10, fontWeight: '700' }}>
                                      {val}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>

                            <TouchableOpacity 
                              style={[styles.rsvpSubmitBtnMobile, { backgroundColor: selectedTpl.accentColor }]}
                              onPress={() => setRsvpSuccess(true)}
                            >
                              <Text style={{ color: selectedTpl.sampleBg, fontWeight: '700', fontSize: 11 }}>Submit Simulation</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </ScrollView>

                  {/* Phone Tabs Bottom Nav */}
                  <View style={styles.phoneTabsNav}>
                    <TouchableOpacity 
                      onPress={() => setActiveTab('invite')}
                      style={[styles.phoneTabBtn, activeTab === 'invite' && styles.phoneTabBtnActive]}
                    >
                      <FontAwesome name="envelope-o" size={13} color={activeTab === 'invite' ? '#c9a96e' : '#888'} />
                      <Text style={[styles.tabLabelMobile, activeTab === 'invite' && { color: '#c9a96e' }]}>Invite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setActiveTab('dress')}
                      style={[styles.phoneTabBtn, activeTab === 'dress' && styles.phoneTabBtnActive]}
                    >
                      <FontAwesome name="paint-brush" size={13} color={activeTab === 'dress' ? '#c9a96e' : '#888'} />
                      <Text style={[styles.tabLabelMobile, activeTab === 'dress' && { color: '#c9a96e' }]}>Dress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setActiveTab('timeline')}
                      style={[styles.phoneTabBtn, activeTab === 'timeline' && styles.phoneTabBtnActive]}
                    >
                      <FontAwesome name="calendar" size={13} color={activeTab === 'timeline' ? '#c9a96e' : '#888'} />
                      <Text style={[styles.tabLabelMobile, activeTab === 'timeline' && { color: '#c9a96e' }]}>Timeline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setActiveTab('registry')}
                      style={[styles.phoneTabBtn, activeTab === 'registry' && styles.phoneTabBtnActive]}
                    >
                      <FontAwesome name="gift" size={13} color={activeTab === 'registry' ? '#c9a96e' : '#888'} />
                      <Text style={[styles.tabLabelMobile, activeTab === 'registry' && { color: '#c9a96e' }]}>Registry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setActiveTab('party')}
                      style={[styles.phoneTabBtn, activeTab === 'party' && styles.phoneTabBtnActive]}
                    >
                      <FontAwesome name="users" size={13} color={activeTab === 'party' ? '#c9a96e' : '#888'} />
                      <Text style={[styles.tabLabelMobile, activeTab === 'party' && { color: '#c9a96e' }]}>Party</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setActiveTab('rsvp')}
                      style={[styles.phoneTabBtn, activeTab === 'rsvp' && styles.phoneTabBtnActive]}
                    >
                      <FontAwesome name="check-square-o" size={13} color={activeTab === 'rsvp' ? '#c9a96e' : '#888'} />
                      <Text style={[styles.tabLabelMobile, activeTab === 'rsvp' && { color: '#c9a96e' }]}>RSVP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.confirmEditorBtn}
                onPress={() => {
                  handleSelect(selectedTpl.name);
                  setSelectedTpl(null);
                }}
              >
                <Text style={styles.confirmEditorBtnText}>Confirm Purchase ({selectedTpl.priceLabel})</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 169, 110, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    color: '#c9a96e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    color: '#c9a96e',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: '#a0937d',
    marginTop: 6,
    lineHeight: 18,
  },
  list: {
    gap: 24,
  },
  card: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBanner: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bannerSubtext: {
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 4,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f0e8',
  },
  priceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(201, 169, 110, 0.1)',
    borderColor: 'rgba(201, 169, 110, 0.25)',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c9a96e',
  },
  styleDesc: {
    fontSize: 13,
    color: '#a0937d',
    lineHeight: 18,
  },
  featureListContainer: {
    marginVertical: 4,
    gap: 6,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureBullet: {
    color: '#c9a96e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  featureText: {
    color: '#a0937d',
    fontSize: 12,
  },
  vibeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vibeLabel: {
    fontSize: 10,
    color: '#6b6157',
    fontWeight: '700',
  },
  vibeValue: {
    fontSize: 11,
    color: '#c9a96e',
    backgroundColor: 'rgba(201, 169, 110, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.3)',
    borderRadius: 10,
    flex: 1,
  },
  previewBtnText: {
    color: '#c9a96e',
    fontWeight: '600',
    fontSize: 13,
  },
  selectBtn: {
    backgroundColor: '#c9a96e',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1.3,
  },
  selectBtnText: {
    color: '#0d0d1a',
    fontWeight: '700',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  modalNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
    backgroundColor: 'rgba(26, 26, 46, 0.45)',
  },
  closeModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closeModalText: {
    color: '#ff7b7b',
    fontSize: 13,
    fontWeight: '600',
  },
  modalNavbarTitle: {
    color: '#c9a96e',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  editorBox: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  editorTitle: {
    color: '#c9a96e',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.1)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 10,
    backgroundColor: 'rgba(201, 169, 110, 0.03)',
  },
  accordionTitle: {
    color: '#c9a96e',
    fontSize: 13,
    fontWeight: '600',
  },
  accordionBody: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.1)',
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#a0937d',
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#f5f0e8',
    fontSize: 13,
  },
  mockupHeader: {
    fontSize: 14,
    color: '#a0937d',
    fontFamily: 'SpaceMono',
    fontWeight: '600',
    marginTop: 10,
  },
  phoneShell: {
    width: 250,
    height: 480,
    backgroundColor: '#111',
    borderWidth: 6,
    borderColor: '#222',
    borderRadius: 36,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 100,
    height: 14,
    backgroundColor: '#222',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 100,
    transform: [{ translateX: -50 }],
  },
  phoneScreen: {
    flex: 1,
    position: 'relative',
  },
  cardInside: {
    borderWidth: 1,
    borderRadius: 14,
    width: '100%',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  inviteOverline: {
    fontSize: 6,
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  inviteNames: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 8,
  },
  lineDivider: {
    width: 30,
    borderBottomWidth: 1,
    marginVertical: 4,
  },
  inviteDate: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  inviteLocation: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
  },
  lineDividerShort: {
    width: 15,
    borderBottomWidth: 0.8,
    marginVertical: 4,
  },
  inviteDetails: {
    fontSize: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 4,
    lineHeight: 11,
  },
  rsvpBtn: {
    paddingVertical: 6,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  rsvpBtnText: {
    fontSize: 9,
    fontWeight: '700',
  },
  confirmEditorBtn: {
    backgroundColor: '#c9a96e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  confirmEditorBtnText: {
    color: '#0d0d1a',
    fontSize: 15,
    fontWeight: '700',
  },

  /* --- ELYSIAN ARCH TEMPLATE STYLES --- */
  elysianInviteContainer: {
    width: '100%',
    alignItems: 'center',
  },
  elysianHeroSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  elysianArcText: {
    fontSize: 7.5,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  elysianArchedImageFrame: {
    width: 140,
    height: 190,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 30, 28, 0.15)',
  },
  elysianCouplePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  elysianWaveformSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  waveformIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 24,
    marginBottom: 6,
  },
  waveBar: {
    width: 1.8,
    backgroundColor: '#1a1a1a',
    borderRadius: 1.5,
  },
  elysianWaveformSubtitle: {
    fontSize: 7,
    letterSpacing: 1.5,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  elysianCoupleNames: {
    fontSize: 18,
    fontWeight: '400',
    color: '#111111',
    marginTop: 4,
    textAlign: 'center',
  },
  elysianDateSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  elysianDateArchFrame: {
    width: '95%',
    borderWidth: 1,
    borderColor: 'rgba(26, 30, 28, 0.15)',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  elysianJoinUs: {
    fontSize: 7,
    letterSpacing: 1.5,
    color: '#666666',
    marginBottom: 4,
  },
  elysianDateLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  elysianDetailsBlock: {
    alignItems: 'center',
    gap: 2,
  },
  elysianTimeDetails: {
    fontSize: 9,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 12,
  },
  elysianLocationDetails: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 11,
  },

  /* Simulated phone nav tabs */
  phoneTabsNav: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    backgroundColor: '#111',
    borderTopWidth: 1,
  },
  phoneTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  phoneTabBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  tabLabelMobile: {
    fontSize: 7.5,
    color: '#888',
    marginTop: 2,
    fontWeight: '600',
  },

  /* Custom tabs mockup containers */
  mockupSectionContainer: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  mockupSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  mockupSectionText: {
    fontSize: 9.5,
    lineHeight: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  mockupSectionSub: {
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
    textAlign: 'center',
  },
  swatchesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  swatchItem: {
    alignItems: 'center',
    gap: 3,
  },
  swatchCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  swatchHex: {
    fontSize: 7,
    fontFamily: 'SpaceMono',
  },
  registryLinksGrid: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  registryMockupBtn: {
    width: '100%',
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entourageListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  entourageMockupCard: {
    width: '45%',
    alignItems: 'center',
  },
  entourageMockupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  entourageMockupRole: {
    fontSize: 8,
    fontWeight: '700',
    opacity: 0.6,
  },
  entourageMockupName: {
    fontSize: 9,
    fontWeight: '600',
  },
  rsvpSuccessCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 10,
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  successText: {
    fontSize: 8.5,
    color: '#888',
    textAlign: 'center',
    marginVertical: 6,
    lineHeight: 12,
  },
  rsvpResetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  rsvpFormGroup: {
    width: '100%',
    gap: 4,
  },
  rsvpFormLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  rsvpSubmitBtnMobile: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  standardMockupPhotoFrame: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  standardMockupPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timelineList: {
    width: '100%',
    paddingLeft: 12,
    gap: 12,
    position: 'relative',
  },
  elysianTimelineLine: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 3,
    width: 1,
    backgroundColor: 'rgba(26, 30, 28, 0.15)',
  },
  timelineItemCard: {
    position: 'relative',
    width: '100%',
  },
  elysianTimelineDot: {
    position: 'absolute',
    left: -12,
    top: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#faf8f5',
    zIndex: 2,
  },
  elysianTimelineContent: {
    gap: 1,
  },
  elysianTimelineTime: {
    fontSize: 8,
    fontWeight: '700',
    color: '#666666',
  },
  elysianTimelineTitle: {
    fontSize: 10,
    fontWeight: '600',
  },
  elysianTimelineDesc: {
    fontSize: 8.5,
    color: '#555555',
    lineHeight: 11,
  },
});
