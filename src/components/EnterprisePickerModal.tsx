// src/components/EnterprisePickerModal.tsx
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { EnterpriseItem, useEnterprise } from '../../contexts/EnterpriseContext';
import colors from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function EnterprisePickerModal({ visible, onClose }: Props) {
  const router = useRouter();
  const { enterprises, activeEnterprise, selectEnterprise } = useEnterprise();

  const handleSelect = async (item: EnterpriseItem) => {
    await selectEnterprise(item);
    onClose();
  };

  const handleCreateNew = () => {
    onClose();
    router.push('/Enterprise');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Selecionar Empresa</Text>
              <Text style={styles.subtitle}>
                Alterne o contexto de visualização do app
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {enterprises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma empresa cadastrada no momento.
              </Text>
            </View>
          ) : (
            <FlatList
              data={enterprises}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = activeEnterprise?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.enterpriseItem,
                      isSelected && styles.enterpriseItemActive,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {item.company_name}
                      </Text>
                      <Text style={styles.cnpjText}>
                        CNPJ: {item.company_id}
                      </Text>
                      {item.city && (
                        <Text style={styles.locationText}>
                          {item.city}
                          {item.state ? ` - ${item.state}` : ''}
                        </Text>
                      )}
                    </View>

                    {isSelected ? (
                      <View style={styles.checkCircleActive}>
                        <Feather name="check" size={16} color="#fff" />
                      </View>
                    ) : (
                      <View style={styles.checkCircleInactive} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateNew}
            >
              <Feather name="plus-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.createButtonText}>
                Cadastrar Nova Empresa / Cliente
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  list: {
    marginBottom: 12,
  },
  enterpriseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    marginBottom: 10,
  },
  enterpriseItemActive: {
    backgroundColor: '#eef6ff',
    borderColor: colors.primary,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  companyName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  cnpjText: {
    fontSize: 13,
    color: '#555',
  },
  locationText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  checkCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ccc',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  footer: {
    paddingTop: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

