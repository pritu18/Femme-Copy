
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-femme-pink-light/50 to-white">
      <header className="p-4 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-femme-burgundy">
              {t('app.name')} - {t('app.tagline')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-femme-burgundy">{t('period.tracker')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('period.cycle')}</p>
                  <Button variant="outline" className="mt-4">{t('period.symptoms')}</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-femme-burgundy">{t('health.waterIntake')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('health.sleep')}</p>
                  <Button variant="outline" className="mt-4">{t('health.weight')}</Button>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-femme-burgundy">{t('doctor.findNearby')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button>{t('doctor.schedule')} {t('doctor.appointment')}</Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
