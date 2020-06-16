# MARVEL CHAMPIONS SOLO TRACKER STATS - CHROME EXTENSION - INSTALLATION GUIDE 
---
## LIRE ATTENTIVEMENT AVANT L'INSTALLATION
Quelques pr�cautions/rappels avant de proc�der � l'installation de l'extension:
* cette extension n'a �t� d�velopp�e et test�e que sous Windows 10 et Chrome 83. Elle ne fonctionne pas pour Firefox. Je ne sais pas si elle fonctionne sous Chrome Mac.
* l'auteur du site de tracking [MC Solo Tracker](https://marvelchampions.azurewebsites.net/) pr�conise une utilisation sur mobile. Or cette extension est plut�t vou�e � �tre utilis�e sur un ordinateur. Si vous avez utilis� l'outil pour logger vos parties depuis votre mobile alors cette extension ne vous sera pas utile car il n'existe pas encore � ce jour de m�canisme de synchronisation entre vos diff�rents appareils.
* l'extension doit �tre utilis�e sur le m�me ordinateur + navigateur que celui qui vous sert � saisir le r�sultat de vos parties solo
* cette extension ne peut pas fonctionner en navigation priv�e
* cette extension peut cesser de fonctionner du jour au lendemain en cas de mise � jour impactante dans la structure de donn�es du site [MC Solo Tracker](https://marvelchampions.azurewebsites.net/)
* les noms des m�chants et sc�narios sont en anglais, c'est ainsi qu'ils sont r�cup�r�s depuis le site de tracking

**Note:** cette extension n'�tant pas publi�e sur le Chrome Web Store, il vous faut utiliser Chrome en mode d�veloppeur. Rien de bien grave, c'est tr�s facile (cf. d�tails dans la proc�dure ci-dessous).
Il y a toutefois un inconv�nient un peu g�nant: lors du lancement de Chrome, une popup peut appara�tre pour vous sugg�rer de d�sactiver ce mode d�veloppeur. Il suffit alors de la fermer en cliquant sur la croix (**attention** de ne pas cliquer sur le bouton "D�sactiver" !).
![](docs/install/warning_mode_dev.png)


## COMMENT INSTALLER L'EXTENSION ?
1. T�l�chargez le zip de la derni�re version de l'extension disponible [ici](https://github.com/nidragedd/mc_solo_tracker_extension/blob/master/mc_solo_tracker_v0.2.zip). (Autre option pour d�veloppeurs ou si vous voulez �tre certains du code qui est ex�cut�: vous pouvez cloner ce repository de code et aller directement � l'�tape 3).
2. D�zippez quelque part sur votre ordinateur:
![](docs/install/install_step1.jpg)
![](docs/install/install_step2.jpg)

3. Ouvrez un nouvel onglet dans chrome et saisissez dans la barre d'adresse: chrome://extensions. Puis faites basculer le "mode d�veloppeur" afin de pouvoir visualiser le bouton "Charger l'extension non empaquet�e".
![](docs/install/install_step3.jpg)

4. Naviguez jusqu'au dossier racine de l'extension. Puis cliquez sur "S�lectionner un dossier".
![](docs/install/install_step4.jpg)

5. Si tout s'est bien pass�, il devrait y avoir la petite ic�ne Spiderman en haut et cette extension affich�e:
![](docs/install/install_step5.jpg)

6. Cliquez sur l'ic�ne Spiderman, cela devrait afficher un message indiquant que les donn�es ne sont pas disponibles. En effet, celles-ci ne sont synchronis�es que lorsque le site [MC Solo Tracker](https://marvelchampions.azurewebsites.net/) est visit� avec cette extension install�e.
![](docs/install/install_step6.jpg)

7. Visitez le site de tracking [MC Solo Tracker](https://marvelchampions.azurewebsites.net/) puis recliquez sur l'ic�ne Spiderman. Cette fois-ci, les donn�es devraient avoir �t� charg�es correctement et la popup devrait afficher des statistiques.
![](docs/install/install_step7.jpg)


## INSTALLER UNE NOUVELLE VERSION DE L'EXTENSION
| Version | Lien | Description                                                                                                                                                                                      |
|---------|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0.1     | [Download](https://github.com/nidragedd/mc_solo_tracker_extension/blob/master/mc_solo_tracker.zip)      | Version initiale, contient les statistiques pour chaque couple m�chant+sc�nario                                                                                                                  |
| 0.2     | [Download](https://github.com/nidragedd/mc_solo_tracker_extension/blob/master/mc_solo_tracker_v0.2.zip) | Ajout des statistiques similaires pour chaque m�chant (sans devoir filtrer sur un sc�nario) Correction de l'effet d�sagr�able sur la s�lection de m�chant ou sc�nario (remont�e en haut de page) |

Proc�d�:
1. T�l�chargez le zip correspondant � la version souhait�e et d�zippez le quelque part sur votre ordinateur, tout comme pour l'installation de base.

2. Ouvrez un nouvel onglet dans chrome et saisissez dans la barre d'adresse: chrome://extensions. Vous pouvez alors supprimer l'extension d�j� install�e:
![](docs/install/upgrade_delete_previous.png)

3. Suivez la proc�dure classique d'installation, cette fois-ci en choissisant le dossier contenant la nouvelle version de l'extension.

**Pas de panique !**: si jamais cette manipulation �choue, supprimez l'extension de Chrome ainsi que tous les dossiers contenant les diff�rentes versions de l'extension puis recommencez la proc�dure de base.  
**Aucune** donn�e n'�tant sauvegard�e directement dans l'extension, vous ne pouvez pas perdre votre progression qui reste, quant � elle, stock�e sur le site de tracking [MC Solo Tracker](https://marvelchampions.azurewebsites.net/).