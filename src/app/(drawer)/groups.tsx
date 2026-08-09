import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLMS, Group, GroupMessage, GroupFile, GroupAnnouncement } from '@/context/LMSContext';
import { Colors, Spacing } from '@/constants/theme';

export default function GroupsScreen() {
  const { user, groups, isDarkMode, createGroup, joinGroup, postAnnouncement, postMessage, shareFile } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'chat' | 'files'>('announcements');

  // Sync selected group with context updates
  useEffect(() => {
    if (selectedGroup) {
      const updated = groups.find(g => g.id === selectedGroup.id);
      if (updated) {
        setSelectedGroup(updated);
      }
    }
  }, [groups]);

  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Announcement inputs
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);

  // Chat message input
  const [chatMsg, setChatMsg] = useState('');
  const chatScrollRef = useRef<ScrollView>(null);

  // File upload input
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');

  const [actionLoading, setActionLoading] = useState(false);

  const handleJoin = async () => {
    if (joinCode.trim() === '') {
      alert('Please enter a group code.');
      return;
    }
    setActionLoading(true);
    const joined = await joinGroup(joinCode.trim());
    setActionLoading(false);
    if (joined) {
      setJoinCode('');
      setSelectedGroup(joined);
    }
  };

  const handleCreate = async () => {
    if (newGroupName.trim() === '' || newGroupDesc.trim() === '') {
      alert('Please enter a group name and description.');
      return;
    }
    setActionLoading(true);
    const created = await createGroup(newGroupName.trim(), newGroupDesc.trim());
    setActionLoading(false);
    if (created) {
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateModal(false);
      setSelectedGroup(created);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!selectedGroup) return;
    if (annTitle.trim() === '' || annContent.trim() === '') {
      alert('Please enter announcement title and content.');
      return;
    }
    setActionLoading(true);
    const updated = await postAnnouncement(selectedGroup.id, annTitle.trim(), annContent.trim());
    setActionLoading(false);
    if (updated) {
      setAnnTitle('');
      setAnnContent('');
      setShowAnnForm(false);
    }
  };

  const handleSendChat = async () => {
    if (!selectedGroup || chatMsg.trim() === '') return;
    const content = chatMsg.trim();
    setChatMsg('');
    await postMessage(selectedGroup.id, content);
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleShareFile = async () => {
    if (!selectedGroup) return;
    if (fileName.trim() === '') {
      alert('Please enter a file name.');
      return;
    }
    setActionLoading(true);
    const updated = await shareFile(selectedGroup.id, fileName.trim(), fileSize);
    setActionLoading(false);
    if (updated) {
      setFileName('');
      setFileSize('1.5 MB');
      setShowUploadModal(false);
    }
  };

  if (selectedGroup) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Group Header */}
        <View style={[styles.groupHeader, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
          <Pressable onPress={() => setSelectedGroup(null)} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: theme.primary }]}>← Back to Groups</Text>
          </Pressable>
          <Text style={[styles.groupTitleText, { color: theme.text }]}>{selectedGroup.name}</Text>
          <Text style={[styles.groupDescText, { color: theme.textSecondary }]}>{selectedGroup.description}</Text>
          <View style={[styles.codeBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.codeText, { color: theme.primary }]}>CODE: {selectedGroup.code}</Text>
          </View>
        </View>

        {/* Tabs selector */}
        <View style={[styles.tabBar, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
          {(['announcements', 'chat', 'files'] as const).map(tab => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, isActive && { borderBottomColor: theme.primary }]}
              >
                <Text style={[styles.tabLabel, { color: isActive ? theme.primary : theme.textSecondary, fontWeight: isActive ? '700' : '500' }]}>
                  {label === 'Chat' ? 'Discussion Chat' : label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab contents */}
        <View style={styles.tabContentContainer}>
          {activeTab === 'announcements' && (
            <ScrollView contentContainerStyle={styles.scrollPadding}>
              {user.role === 'instructor' && (
                <View style={styles.announcementActionRow}>
                  {!showAnnForm ? (
                    <Pressable onPress={() => setShowAnnForm(true)} style={[styles.actionButton, { backgroundColor: theme.primary }]}>
                      <Text style={styles.actionBtnText}>📢 Post Announcement</Text>
                    </Pressable>
                  ) : (
                    <View style={[styles.formContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                      <Text style={[styles.formTitle, { color: theme.text }]}>New Announcement</Text>
                      <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                        placeholder="Announcement Title"
                        placeholderTextColor={theme.textSecondary}
                        value={annTitle}
                        onChangeText={setAnnTitle}
                      />
                      <TextInput
                        style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                        placeholder="Write your announcement details here..."
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={annContent}
                        onChangeText={setAnnContent}
                      />
                      <View style={styles.formActions}>
                        <Pressable onPress={() => setShowAnnForm(false)} style={[styles.btnSecondary, { borderColor: theme.border }]}>
                          <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handlePostAnnouncement} disabled={actionLoading} style={[styles.btnPrimary, { backgroundColor: theme.primary }]}>
                          {actionLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.btnPrimaryText}>Post</Text>}
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {selectedGroup.announcements.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyEmoji, { color: theme.textSecondary }]}>📢</Text>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No announcements posted yet.</Text>
                </View>
              ) : (
                selectedGroup.announcements.map(ann => (
                  <View key={ann.id} style={[styles.announcementCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <Text style={[styles.annTitleText, { color: theme.text }]}>{ann.title}</Text>
                    <Text style={[styles.annContentText, { color: theme.textSecondary }]}>{ann.content}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={[styles.footerAuthor, { color: theme.primary }]}>By {ann.postedBy}</Text>
                      <Text style={[styles.footerDate, { color: theme.textSecondary }]}>
                        {new Date(ann.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          {activeTab === 'chat' && (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <ScrollView
                ref={chatScrollRef}
                contentContainerStyle={styles.chatScrollContent}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {selectedGroup.discussions.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyEmoji, { color: theme.textSecondary }]}>💬</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No messages. Start the conversation!</Text>
                  </View>
                ) : (
                  selectedGroup.discussions.map(msg => {
                    const isSelf = msg.senderId === user.name || msg.senderName === user.name;
                    return (
                      <View key={msg.id} style={[styles.messageRow, isSelf ? styles.msgRowRight : styles.msgRowLeft]}>
                        <View style={[
                          styles.messageBubble,
                          isSelf 
                            ? { backgroundColor: theme.primary } 
                            : { backgroundColor: theme.backgroundElement, borderColor: theme.border, borderWidth: 1 }
                        ]}>
                          {!isSelf && <Text style={[styles.senderNameText, { color: theme.primary }]}>{msg.senderName} ({msg.senderRole})</Text>}
                          <Text style={[styles.messageText, { color: isSelf ? '#FFF' : theme.text }]}>{msg.content}</Text>
                          <Text style={[styles.messageTime, { color: isSelf ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
              <View style={[styles.inputBar, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
                <TextInput
                  style={[styles.chatInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                  placeholder="Type a message..."
                  placeholderTextColor={theme.textSecondary}
                  value={chatMsg}
                  onChangeText={chatMsg => setChatMsg(chatMsg)}
                  onSubmitEditing={handleSendChat}
                />
                <Pressable onPress={handleSendChat} style={[styles.sendBtn, { backgroundColor: theme.primary }]}>
                  <Text style={styles.sendBtnText}>Send</Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          )}

          {activeTab === 'files' && (
            <ScrollView contentContainerStyle={styles.scrollPadding}>
              <View style={styles.announcementActionRow}>
                <Pressable onPress={() => setShowUploadModal(true)} style={[styles.actionButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.actionBtnText}>📂 Share a File</Text>
                </Pressable>
              </View>

              {selectedGroup.files.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyEmoji, { color: theme.textSecondary }]}>📁</Text>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No files shared yet in this workspace.</Text>
                </View>
              ) : (
                selectedGroup.files.map(file => (
                  <View key={file.id} style={[styles.fileCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <View style={styles.fileCardInfo}>
                      <Text style={styles.fileIcon}>📄</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.fileNameText, { color: theme.text }]}>{file.name}</Text>
                        <Text style={[styles.fileMetaText, { color: theme.textSecondary }]}>
                          {file.size} • Shared by {file.sharedBy}
                        </Text>
                      </View>
                    </View>
                    <Pressable 
                      onPress={() => alert('Downloading: ' + file.name)} 
                      style={[styles.downloadBtn, { backgroundColor: theme.backgroundSelected }]}
                    >
                      <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>Download</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>

        {/* Share File Modal */}
        <Modal visible={showUploadModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Share File</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="File Name (e.g. project_proposal.pdf)"
                placeholderTextColor={theme.textSecondary}
                value={fileName}
                onChangeText={setFileName}
              />
              <Text style={[styles.labelTitle, { color: theme.textSecondary }]}>FILE SIZE SIMULATION</Text>
              <View style={styles.sizeOptions}>
                {['500 KB', '1.5 MB', '4.2 MB', '12.0 MB'].map(size => (
                  <Pressable
                    key={size}
                    onPress={() => setFileSize(size)}
                    style={[
                      styles.sizeOptionBtn,
                      { borderColor: theme.border },
                      fileSize === size && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                  >
                    <Text style={{ color: fileSize === size ? '#FFF' : theme.text, fontSize: 12 }}>{size}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.modalActions}>
                <Pressable onPress={() => setShowUploadModal(false)} style={[styles.btnSecondary, { borderColor: theme.border }]}>
                  <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleShareFile} disabled={actionLoading} style={[styles.btnPrimary, { backgroundColor: theme.primary }]}>
                  {actionLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.btnPrimaryText}>Share</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.introHeader}>
        <Text style={[styles.title, { color: theme.text }]}>👥 Collaborative Group Workspace</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Join forces with other peers, exchange resource files, post updates and announcements, and collaborate in real time.
        </Text>
      </View>

      {/* Action panel (role dependent) */}
      <View style={[styles.actionPanel, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {user.role === 'instructor' ? (
          <View style={styles.actionBlock}>
            <Text style={[styles.blockTitle, { color: theme.text }]}>Manage Your Workspace Groups</Text>
            <Text style={[styles.blockDesc, { color: theme.textSecondary }]}>
              As an authorized Academy Instructor, you can create workspace groups, manage announcements, and provide tutoring workspace for students.
            </Text>
            <Pressable onPress={() => setShowCreateModal(true)} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.buttonText}>✨ Create a Group</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionBlock}>
            <Text style={[styles.blockTitle, { color: theme.text }]}>Join a Group Workspace</Text>
            <Text style={[styles.blockDesc, { color: theme.textSecondary }]}>
              Enter a unique 6-character Workspace Code shared by your course instructor to join their study group.
            </Text>
            <View style={styles.joinInputRow}>
              <TextInput
                style={[styles.joinInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="e.g. GR-4890"
                placeholderTextColor={theme.textSecondary}
                value={joinCode}
                onChangeText={joinCode => setJoinCode(joinCode)}
                autoCapitalize="characters"
              />
              <Pressable onPress={handleJoin} disabled={actionLoading} style={[styles.primaryButton, styles.joinBtn, { backgroundColor: theme.primary }]}>
                {actionLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Join</Text>}
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Groups List */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Workspace Groups</Text>
      {groups.length === 0 ? (
        <View style={[styles.noGroupsCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={styles.noGroupsEmoji}>🕸️</Text>
          <Text style={[styles.noGroupsText, { color: theme.textSecondary }]}>
            You haven't joined any groups yet. {user.role === 'instructor' ? 'Create a group above to get started!' : 'Ask your instructor for a group code to join!'}
          </Text>
        </View>
      ) : (
        <View style={styles.groupsGrid}>
          {groups.map(group => (
            <Pressable
              key={group.id}
              onPress={() => setSelectedGroup(group)}
              style={({ pressed }) => [
                styles.groupCard,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                pressed && { transform: [{ scale: 0.98 }] }
              ]}
            >
              <View style={styles.groupCardHeader}>
                <Text style={[styles.groupCardName, { color: theme.text }]}>{group.name}</Text>
                <View style={[styles.codeBadgeSmall, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.codeTextSmall, { color: theme.primary }]}>{group.code}</Text>
                </View>
              </View>
              <Text style={[styles.groupCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {group.description}
              </Text>
              <View style={styles.groupCardFooter}>
                <Text style={[styles.memberCountText, { color: theme.textSecondary }]}>
                  👥 {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                </Text>
                <Text style={[styles.enterText, { color: theme.primary }]}>Enter Workspace →</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Create Group Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Group Workspace</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Group Name (e.g. Advanced AI Study)"
              placeholderTextColor={theme.textSecondary}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Short Description of what the group collaborates on..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowCreateModal(false)} style={[styles.btnSecondary, { borderColor: theme.border }]}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreate} disabled={actionLoading} style={[styles.btnPrimary, { backgroundColor: theme.primary }]}>
                {actionLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.btnPrimaryText}>Create</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollPadding: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  introHeader: {
    gap: 8,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionPanel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.four,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  actionBlock: {
    gap: 12,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  blockDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  primaryButton: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 4,
  },
  joinInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  joinBtn: {
    width: 80,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  noGroupsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  noGroupsEmoji: {
    fontSize: 36,
  },
  noGroupsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  groupsGrid: {
    gap: Spacing.three,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupCardName: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: Spacing.two,
  },
  codeBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeTextSmall: {
    fontSize: 10,
    fontWeight: '800',
  },
  groupCardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  groupCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  memberCountText: {
    fontSize: 11,
  },
  enterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  textArea: {
    height: 80,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: 4,
  },
  btnSecondary: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  btnPrimary: {
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    minWidth: 70,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  // Detailed Group Workspace Styles
  groupHeader: {
    padding: Spacing.four,
    borderBottomWidth: 1,
    gap: 6,
  },
  backBtn: {
    marginBottom: Spacing.one,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupTitleText: {
    fontSize: 18,
    fontWeight: '900',
  },
  groupDescText: {
    fontSize: 12,
    lineHeight: 16,
  },
  codeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 12,
  },
  tabContentContainer: {
    flex: 1,
  },
  announcementActionRow: {
    marginBottom: Spacing.one,
  },
  actionButton: {
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  formContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  emptyContainer: {
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
  announcementCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: 8,
    marginBottom: Spacing.three,
  },
  annTitleText: {
    fontSize: 14,
    fontWeight: '800',
  },
  annContentText: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  footerAuthor: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerDate: {
    fontSize: 10,
  },
  // Chat Discussion Styles
  chatScrollContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    gap: 4,
  },
  senderNameText: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    padding: Spacing.two,
    borderTopWidth: 1,
    gap: Spacing.two,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  sendBtn: {
    width: 64,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // File Workspace Styles
  fileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  fileCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
    marginRight: Spacing.two,
  },
  fileIcon: {
    fontSize: 24,
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fileMetaText: {
    fontSize: 10,
  },
  downloadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  labelTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sizeOptionBtn: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
