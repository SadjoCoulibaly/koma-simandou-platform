export function getComposantes(t) {
  return [
    {
      id: 1,
      slug: 'entreprises',
      n:        t('composantes.comp1n'),
      iconKey:  'building',
      title:    t('composantes.comp1title'),
      desc:     t('composantes.comp1desc'),
      tags:     t('composantes.comp1tags', { returnObjects: true }),
      why: {
        intro: t('composantes.comp1whyIntro'),
        label: t('composantes.comp1whyLabel'),
        list:  t('composantes.comp1whyList', { returnObjects: true }),
      },
      reg: {
        intro: t('composantes.comp1regIntro'),
        items: t('composantes.comp1regItems', { returnObjects: true }),
      },
    },
    {
      id: 2,
      slug: 'equipements',
      n:        t('composantes.comp2n'),
      iconKey:  'equip',
      title:    t('composantes.comp2title'),
      desc:     t('composantes.comp2desc'),
      tags:     t('composantes.comp2tags', { returnObjects: true }),
      why: {
        intro: t('composantes.comp2whyIntro'),
        label: t('composantes.comp2whyLabel'),
        list:  t('composantes.comp2whyList', { returnObjects: true }),
      },
      reg: {
        intro: t('composantes.comp2regIntro'),
        items: t('composantes.comp2regItems', { returnObjects: true }),
      },
    },
    {
      id: 3,
      slug: 'projets-publics',
      n:        t('composantes.comp3n'),
      iconKey:  'state',
      title:    t('composantes.comp3title'),
      desc:     t('composantes.comp3desc'),
      tags:     t('composantes.comp3tags', { returnObjects: true }),
      why: {
        intro: t('composantes.comp3whyIntro'),
        label: t('composantes.comp3whyLabel'),
        list:  t('composantes.comp3whyList', { returnObjects: true }),
      },
      reg: {
        intro: t('composantes.comp3regIntro'),
        items: t('composantes.comp3regItems', { returnObjects: true }),
      },
    },
    {
      id: 4,
      slug: 'projets-prives',
      n:        t('composantes.comp4n'),
      iconKey:  'private',
      title:    t('composantes.comp4title'),
      desc:     t('composantes.comp4desc'),
      tags:     t('composantes.comp4tags', { returnObjects: true }),
      why: {
        intro: t('composantes.comp4whyIntro'),
        label: t('composantes.comp4whyLabel'),
        list:  t('composantes.comp4whyList', { returnObjects: true }),
      },
      reg: {
        intro: t('composantes.comp4regIntro'),
        items: t('composantes.comp4regItems', { returnObjects: true }),
      },
    },
  ]
}
