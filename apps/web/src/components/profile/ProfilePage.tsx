// Orquestador del perfil: combina el hook y los sub-componentes.
import { useState } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useCollections } from "../../hooks/useCollections";
import ProfileHeader from "./ProfileHeader";
import ProfileCollections from "./ProfileCollections";
import RecommendedUsers from "./RecommendedUsers";
import FollowedUsers from "./FollowedUsers";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

export default function ProfilePage() {
  const {
    user,
    loadingUser,
    saving,
    deleting,
    feedback,
    uploadingAvatar,
    deletingAvatar,
    handleSave,
    handleDelete,
    handleLogout,
    handleAvatarUpload,
    handleAvatarDelete,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const collectionHelpers = useCollections();
  const { collections } = collectionHelpers;

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center py-32 text-white/30 text-sm">
        Cargando…
      </div>
    );
  }

  return (
    <>
      {/* Modal de edicion */}
      {isEditing && user && (
        <EditModal
          initial={{
            username: user.username,
            email: user.email,
            newsletter: user.newsletter,
            password: "",
          }}
          saving={saving}
          onSave={(form) => {
            handleSave(form, () => setIsEditing(false));
          }}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Modal de confirmacion de borrado */}
      {isDeleting && (
        <DeleteModal
          deleting={deleting}
          onConfirm={handleDelete}
          onClose={() => setIsDeleting(false)}
        />
      )}

      <div className="flex flex-col gap-0">
        <ProfileHeader
          user={user}
          collections={collections}
          uploadingAvatar={uploadingAvatar}
          deletingAvatar={deletingAvatar}
          onEdit={() => setIsEditing(true)}
          onLogout={handleLogout}
          onAvatarUpload={handleAvatarUpload}
          onAvatarDelete={handleAvatarDelete}
        />

        {/* Feedback */}
        {feedback && (
          <div
            className={[
              "mx-0 mt-4 rounded-xl px-4 py-3 text-sm font-medium",
              feedback.type === "ok"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400",
            ].join(" ")}
          >
            {feedback.msg}
          </div>
        )}

        {/* Contenido principal */}
        <div className="mt-8 flex flex-col gap-10">
          <ProfileCollections {...collectionHelpers} />

          {user && (
            <section className="pt-6 border-t border-bone dark:border-night-edge">
              <FollowedUsers userId={user.id} />
            </section>
          )}

          {user && (
            <section className="pt-6 border-t border-bone dark:border-night-edge">
              <RecommendedUsers userId={user.id} showBar />
            </section>
          )}

          {/* Borrado de cuenta */}
          {user && (
            <section className="pt-6 border-t border-bone dark:border-night-edge">
              <button
                id="profile-delete-btn"
                onClick={() => setIsDeleting(true)}
                className="px-5 py-2 rounded-full border border-red-700/50 text-red-500
                           text-xs font-bold uppercase tracking-wide bg-transparent
                           hover:bg-red-700/20 hover:border-red-500 transition-all duration-200 cursor-pointer"
              >
                Eliminar cuenta
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
